const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');
const Request = require('./Requestschema.js');
const cors = require('cors');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./ChatSchema.js');


const app = express();
app.use(express.json());
app.use(cors());
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect('mongodb+srv://charithpuligundla:Charith%402007@cherrycluster.0s50tpu.mongodb.net/collegeCart?retryWrites=true&w=majority&appName=cherryCluster')
  .then(() => console.log('mongodb connected'))
  .catch(err => console.log('connection failed', err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});


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

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verifyLink = `http://localhost:5000/verify-email/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `
        <h3>Welcome </h3>
        <p>Click below to verify your email:</p>
        <a href="${verifyLink}">Verify Email</a>
      `
    });

    res.status(200).json({ message: "Verification email sent", user: newUser });
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

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ message: 'login sucessful', token, user: user });
});

app.get("/verify-email/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    await User.findByIdAndUpdate(decoded.userId, {
      isVerified: true
    });
    res.send("Email verified successfully ✅");
  } catch (err) {
    res.status(400).send("Invalid or expired link ❌");
  }
});

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
  try {
    const newRequest = new Request({
      userId,
      description,
      address,
      totalAmount,
      requested
    });
    await newRequest.save();
    await User.findByIdAndUpdate(userId, { $inc: { no_requests: 1 } });
    res.status(201).json({ message: 'Request created successfully', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
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

app.post('/accept-request/:requestId', async (req, res) => {
  const { accepterId, requesterId } = req.body;

  const request = await Request.findById(req.params.requestId);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  request.acceptedBy = accepterId;
  request.status = 'accepted';
  await request.save(); 

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


  const user = await User.findById(requesterId);
  const email = user.email;
  await transporter.sendMail({
    to: email,
    subject: "Request Accepted",
    html: `
        <p>you requeste has been accepted go to the website and make payment to procced.</p>
        <p>Be lazy be happy</p>
      `
  });


  res.json({ chatId: chat._id });
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
    .populate('messages.sender', 'userName');

  res.json(chat);
});

app.get('/getoutpeople', async (req, res) => {
  const people = await User.find({ status: "out" });
  res.status(200).json(people);
});

app.post('/changestatus', async (req, res) => {
  const { userId } = req.body;
  const person=await User.findById(userId);
  let status=person.status;
  if(status=="in"){
    status="out";
  }
  else{
    status="in";
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { status: status } },
    { new: true }
  );
  res.json(user);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
