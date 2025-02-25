const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Hardcoded users as per requirements
const users = [
  { username: 'user1', password: 'user1' },
  { username: 'user2', password: 'user2' }
];

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user in hardcoded list
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      token,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};