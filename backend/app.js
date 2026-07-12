const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');
const Request = require('./Requestschema.js');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./ChatSchema.js');
const Product = require('./ProductSchema.js');
require('dotenv').config();
// const Razorpay = require('./Razorpay.js');
const crypto = require("crypto");
const { sendEmail } = require('./services/emailService');

// const backenduri="https://college-cart-epzl.onrender.com";
const backenduri = "http://localhost:5000";

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;
const mongodburl = process.env.MONGODBURL;
const mail = process.env.EMAIL;
console.log(`email:${mail}`);

mongoose.connect(mongodburl)
  .then(() => console.log('mongodb connected'))
  .catch(err => console.log('connection failed', err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

const calculateDeliveryFee = (totalAmount, isPremium) => {
  const rate = isPremium ? 0.08 : 0.06;
  let fee = Math.floor(totalAmount * rate);
  if (fee < 5) fee = 5;
  if (fee > 50) fee = 50;
  return fee;
};

const checkAndExpirePremium = async (request) => {
  if (request.ispremium) {
    const now = new Date();
    const created = new Date(request.createdAt);
    if ((now - created) > 60 * 60 * 1000) {
      request.ispremium = false;
      request.deliveryFee = calculateDeliveryFee(request.totalAmount, false);
      request.amountToPay = request.totalAmount + request.deliveryFee;
      await request.save();
    }
  }
};

app.post('/signup', async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, JWT_SECRET, { expiresIn: '30d' });
      const verifyLink = `${backenduri}/verify-email/${token}`;
      try {
        await sendEmail({
          to: email,
          subject: "Verify your email",
          html: `<a href="${verifyLink}">Verify Email</a>`
        });
        console.log("✅ Mail sent");
      } catch (err) {
        console.error("❌ Mail error:", err);
      }

      res.status(200).json({ message: "Verification email sent", token, user: newUser });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      degree: req.body.degree,
      branch: req.body.branch,
      year: req.body.year,
      mobileNumber: req.body.number,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    const verifyLink = `${backenduri}/verify-email/${token}`;

    try {
      await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `<a href="${verifyLink}">Verify Email</a>`
      });
      console.log("✅ Mail sent");
    } catch (err) {
      console.error("❌ Mail error:", err);
    }

    res.status(200).json({ message: "Verification email sent", token, user: newUser });
  }
  catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('user not found please sign-up');

  if (!user.isVerified) return res.status(401).send("Please verify your email first");


  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('invalid password');

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  res.status(200).json({ message: 'login sucessful', token, user: user });
});

app.get("/verify-email/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.id, {
      isVerified: true
    });
    res.send("Email verified successfully ✅");
  } catch (err) {
    res.status(400).send("Invalid or expired link ❌");
  }
});


app.use(protect);


app.post('/getuser', async (req, res) => {
  const { profileId } = req.body;
  try {
    const user = await User.findById(profileId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User found successfully', user });
  }
  catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

app.post('/request', async (req, res) => {
  const { userId, description, address, totalAmount, requested, ispremium } = req.body;
  let deliveryFee = calculateDeliveryFee(totalAmount, Boolean(ispremium));
  let amountToPay = totalAmount + deliveryFee;
  try {
    const newRequest = new Request({
      userId,
      description,
      address,
      totalAmount,
      amountToPay,
      deliveryFee,
      requested,
      ispremium: Boolean(ispremium),
    });
    await newRequest.save();
    await User.findByIdAndUpdate(userId, { $inc: { no_requests: 1 } });
    res.status(201).json({ message: 'Request created successfully', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

app.put('/request/:requestId', async (req, res) => {
  try {
    const { userId, description, address, totalAmount, requested, ispremium } = req.body;
    const request = await Request.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await checkAndExpirePremium(request);

    if (request.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    let deliveryFee = calculateDeliveryFee(totalAmount, Boolean(ispremium));
    let amountToPay = totalAmount + deliveryFee;

    request.description = description;
    request.address = address;
    request.totalAmount = totalAmount;
    request.ispremium = Boolean(ispremium);
    request.amountToPay = amountToPay;
    request.deliveryFee = deliveryFee;
    request.requested = requested;

    await request.save();

    res.status(200).json({ message: 'Request updated successfully', request });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

app.post('/getrequest', async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ request });
  }
  catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }

})


app.get('/getrequests', async (req, res) => {
  try {
    const requests = await Request.find().populate('userId', 'email userName');
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

app.post('/myrequests', async (req, res) => {
  const { userId } = req.body;
  try {
    const orders = await Request.find({ userId: userId })
      .populate('userId', 'email userName')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  }
  catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
})

app.post('/myaccepts', async (req, res) => {
  const { userId } = req.body;
  try {
    const deliveries = await Request.find({ acceptedBy: userId })
      .populate('userId', 'email userName')
      .populate('acceptedBy', 'email userName')
      .sort({ createdAt: -1 });
    res.status(200).json(deliveries);
  }
  catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
})

app.post('/reject-request/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;
  if (!accepterId || !requesterId) {
    return res.status(404).json({ message: "User not found" });
  }

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await checkAndExpirePremium(request);

  let chat = await Chat.findOne({
    requestId: request._id
  });

  if (chat) {
    await chat.deleteOne();
  }

  request.rejected.push(accepterId);
  request.acceptedBy = null;
  request.status = 'pending';
  request.chatId = null;
  await request.save();
  const accepter = await User.findById(accepterId);
  const requester = await User.findById(requesterId);

  const email1 = requester.email;
  try {
    await sendEmail({
      to: email1,
      subject: "Request rejected",
      html: `
        <p>your request has been rejected by ${accepter.userName} go to the website to know more.</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send rejection email to requester:', error);
  }
  const email2 = accepter.email;
  try {
    await sendEmail({
      to: email2,
      subject: "Request rejected",
      html: `
        <p>you rejected the request posted by ${requester.userName}.</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send rejection email to accepter:', error);
  }
  res.status(200).json({ message: "Request rejected successfully" });
});

app.post('/you-rejected/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;

  if (!accepterId || !requesterId) {
    return res.status(404).json({ message: "User not found" });
  }


  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await checkAndExpirePremium(request);

  let chat = await Chat.findOne({
    requestId: request._id
  });

  if (chat) {
    await chat.deleteOne();
  }

  request.rejected.push(accepterId);
  request.acceptedBy = null;
  request.status = 'pending';
  request.chatId = null;
  await request.save();
  const accepter = await User.findById(accepterId);
  const requester = await User.findById(requesterId);

  const email1 = requester.email;
  try {
    await sendEmail({
      to: email1,
      subject: "rejected delivery",
      html: `
        <p>you rejected ${accepter.userName} as delivery person</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send delivery rejection email to requester:', error);
  }
  const email2 = accepter.email;
  try {
    await sendEmail({
      to: email2,
      subject: "rejected delivery",
      html: `
        <p>you have been rejected as delivery person by ${requester.userName}.</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send delivery rejection email to accepter:', error);
  }
  res.status(200).json({ message: "Request rejected successfully" });
});

app.post('/deliveredA/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;

  if (!accepterId || !requesterId) {
    return res.status(404).json({ message: "User not found" });
  }

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await checkAndExpirePremium(request);

  let chat = await Chat.findOne({
    requestId: request._id
  });

  if (chat) {
    await chat.deleteOne();
  }

  request.status = 'deliveredA';
  request.chatId = null;
  await request.save();

  res.status(200).json({ message: "Order deliverd successfully" });
});

app.post('/deliveredB/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;

  if (!accepterId || !requesterId) {
    return res.status(404).json({ message: "User not found" });
  }

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await checkAndExpirePremium(request);

  const completedAt = new Date();
  const deliveryFee = calculateDeliveryFee(request.totalAmount, request.ispremium);

  request.status = 'deliveredB';
  request.deliveryFee = deliveryFee;
  request.amountToPay = request.totalAmount + deliveryFee;
  await request.save();
  const accepter = await User.findById(accepterId);
  const requester = await User.findById(requesterId);

  await User.findByIdAndUpdate(accepterId, {
    $inc: { no_accepted: 1 }
  });

  const email1 = requester.email;
  try {
    await sendEmail({
      to: email1,
      subject: "your order delivered",
      html: `
        <p>your order deleverd by ${accepter.userName}</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send delivered email to requester:', error);
  }
  const email2 = accepter.email;
  try {
    await sendEmail({
      to: email2,
      subject: "order delivered",
      html: `
        <p>you have been delivered order for ${requester.userName}.</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send delivered email to accepter:', error);
  }
  res.status(200).json({ message: "Order deliverd successfully" });
});

app.post('/accept-request/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await checkAndExpirePremium(request);

  if (request.rejected.includes(accepterId)) {
    return res.status(400).json({
      message: "You have already rejected this request"
    });
  }

  // check if chat already exists
  let chat = await Chat.findOne({
    requestId: request._id
  });

  if (!chat) {
    chat = await Chat.create({
      users: [request.userId, accepterId],
      requestId: request._id
    });
  }

  request.acceptedBy = accepterId;
  request.status = 'accepted';
  request.chatId = chat._id;
  await request.save();

  const user = await User.findById(requesterId);
  const email = user.email;
  try {
    await sendEmail({
      to: email,
      subject: "Request Accepted",
      html: `
        <p>your request has been accepted go to the website and make payment to procced.</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send acceptance email:', error);
  }


  res.json({ chatId: chat._id });
});

app.post('/cancel-request/:requestId', async (req, res) => {
  const { requesterId } = req.body;

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await checkAndExpirePremium(request);

  if (request.status != "pending") return res.status(401).json({ message: 'Request cant be cancelled' });

  request.status = 'cancelled';
  await request.save();

  const user = await User.findById(requesterId);
  const email = user.email;
  try {
    await sendEmail({
      to: email,
      subject: "cancel Request",
      html: `
        <p>you cancelled your request go to the website to know more.</p>
        <p>Be lazy be happy</p>
      `
    });
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }

  res.status(200).json({ message: "Request cancelled successfully" });
});



io.on('connection', socket => {
  socket.on('joinRoom', roomId => {
    socket.join(roomId);
  });

  socket.on('sendMessage', async ({ roomId, senderId, text }) => {
    const chat = await Chat.findById(roomId);

    if (!chat) return;

    chat.messages.push({ sender: senderId, text });
    await chat.save();

    const populatedSender = await User.findById(senderId).select("userName");

    io.to(roomId).emit('receiveMessage', {
      sender: {
        _id: senderId,
        userName: populatedSender.userName
      },
      text
    });
  });
});

app.get('/chat/:chatId', async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate('messages.sender', 'userName')
    .populate('users', 'userName');

  res.json(chat);
});

app.get('/getoutpeople', async (req, res) => {
  const people = await User.find({ status: "out" });
  res.status(200).json(people);
});

app.post('/changestatus', async (req, res) => {
  const { userId } = req.body;
  const person = await User.findById(userId);
  let status = person.status;
  if (status == "in") {
    status = "out";
  }
  else {
    status = "in";
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { status: status } },
    { new: true }
  );
  res.json(user);
});


app.get('/product-search', async (req, res) => {
  try {

    const query = req.query.q?.trim();

    if (!query) {
      return res.status(200).json([]);
    }

    const products = await Product.aggregate([
      {
        $search: {
          index: "product-search",
          compound: {
            should: [

              {
                autocomplete: {
                  query: query,
                  path: "name",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  },
                  score: {
                    boost: {
                      value: 10
                    }
                  }
                }
              },

              {
                autocomplete: {
                  query: query,
                  path: "brand",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  },
                  score: {
                    boost: {
                      value: 8
                    }
                  }
                }
              },

              {
                autocomplete: {
                  query: query,
                  path: "type",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  },
                  score: {
                    boost: {
                      value: 6
                    }
                  }
                }
              },

              {
                autocomplete: {
                  query: query,
                  path: "subcategory",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  },
                  score: {
                    boost: {
                      value: 4
                    }
                  }
                }
              },

              {
                autocomplete: {
                  query: query,
                  path: "category",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 2
                  },
                  score: {
                    boost: {
                      value: 3
                    }
                  }
                }
              }

            ],
            minimumShouldMatch: 1
          }
        }
      },

      {
        $limit: 10
      },

      {
        $project: {

          _id: 1,

          productId: 1,

          name: 1,

          brand: 1,

          type: 1,

          subcategory: 1,

          category: 1,

          weight: 1,

          mrp: 1,

          image_url: 1,

          score: {
            $meta: "searchScore"
          }

        }
      }

    ]);

    res.status(200).json(products);

  }
  catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Search failed."
    });

  }
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
