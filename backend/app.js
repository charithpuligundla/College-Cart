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
require('dotenv').config();
const Razorpay = require('./Razorpay.js');
const crypto = require("crypto");
const { sendEmail } = require('./services/emailService');

const backenduri="https://college-cart-epzl.onrender.com";
// const backenduri = "http://localhost:5000";

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


app.post('/signup', async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      degree: req.body.degree,
      branch: req.body.branch,
      year: req.body.year
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
  const { userId, description, address, totalAmount, requested } = req.body;
  let deliveryFee = Math.floor(totalAmount * 0.06);
  if (deliveryFee < 5) deliveryFee = 5;
  else if (deliveryFee > 50) deliveryFee = 50;
  let amountToPay = totalAmount + deliveryFee + Math.ceil(totalAmount * 0.04);
  let sellerAmount = totalAmount + deliveryFee;
  let razorpayOrder;
  try {
    razorpayOrder = await Razorpay.orders.create({
      amount: amountToPay * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err.message || err);
    return res.status(502).json({ message: 'Failed to create Razorpay order', error: err.message || err });
  }
  try {
    const newRequest = new Request({
      userId,
      description,
      address,
      totalAmount,
      amountToPay,
      deliveryFee,
      sellerAmount,
      requested,
      razorpayOrderId: razorpayOrder.id
    });
    await newRequest.save();
    await User.findByIdAndUpdate(userId, { $inc: { no_requests: 1 } });
    res.status(201).json({ message: 'Request created successfully', request: newRequest });
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

app.post('/verify-payment', async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Generate the expected signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    // 2. Validate signatures
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 3. Update the MongoDB Order to "Paid"

    const updatedOrder = await Request.findByIdAndUpdate(
      dbOrderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid"
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified and order updated successfully!",
      order: updatedOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment verification process failed" });
  }
});


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


  request.status = 'deliveredB';
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

// exports.releasePayment = async (req, res) => {
//     try {

//         const { orderId } = req.params;

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             });
//         }

//         if (order.paymentStatus !== "Paid") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment not captured yet"
//             });
//         }

//         if (order.razorpayTransferId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment already released"
//             });
//         }

//         const seller = await User.findById(order.seller);

//         if (!seller) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Seller not found"
//             });
//         }

//         if (!seller.razorpayFundAccountId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Seller fund account missing"
//             });
//         }

//         //----------------------------------------------------
//         // Create payout
//         //----------------------------------------------------

//         const payout = await axios.post(

//             "https://api.razorpay.com/v1/payouts",

//             {
//                 account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,

//                 fund_account_id: seller.razorpayFundAccountId,

//                 amount: order.sellerAmount * 100,

//                 currency: "INR",

//                 mode: "UPI",

//                 purpose: "payout",

//                 queue_if_low_balance: true,

//                 reference_id: order._id.toString(),

//                 narration: "Marketplace Order Payment"
//             },

//             {
//                 auth: {
//                     username: process.env.RAZORPAY_KEY_ID,
//                     password: process.env.RAZORPAY_KEY_SECRET
//                 },
//                 headers: {
//                     "X-Payout-Idempotency":
//                         `release-${order._id}`
//                 }
//             }

//         );

//         //----------------------------------------------------

//         order.paymentStatus = "Released";

//         order.razorpayTransferId = payout.data.id;

//         await order.save();

//         //----------------------------------------------------

//         res.json({

//             success: true,

//             message: "Seller paid successfully",

//             payout: payout.data

//         });

//     }

//     catch (err) {

//         console.log(err.response?.data || err);

//         res.status(500).json({

//             success: false,

//             error: err.response?.data || err.message

//         });

//     }
// };

app.post('/accept-request/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

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

app.get("/razor", async (req, res) => {

  try {

    const order = await Razorpay.orders.create({

      amount: 100,

      currency: "INR"

    });
    console.log(order);
    res.json(order);

  }

  catch (err) {

    res.status(500).json(err);

  }

});

app.post("/add-seller", async (req, res) => {
  try {
    const { upiId, phone } = req.body;

    if (!upiId) {
      return res.status(400).json({ message: "UPI ID is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const contact = await razorpay.contacts.create({
      name: user.username,
      email: user.email,
      contact: phone || user.phone,
      type: "vendor"
    });

    const fundAccount = await razorpay.fundAccounts.create({
      contact_id: contact.id,
      account_type: "vpa",
      vpa: {
        address: upiId
      }
    });

    user.isseller = true;
    user.upiId = upiId;
    user.razorpayContactId = contact.id;
    user.razorpayFundAccountId = fundAccount.id;

    await user.save();

    res.json({
      success: true,
      message: "Seller Registered successfully",
      seller: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
