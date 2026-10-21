
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate a demonstration OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const message = `
      <h2>Welcome to ShopNest, ${name}!</h2>
      <p>Thank you for registering on our platform.</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to ShopNest - Your OTP',
        message
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
  console.error('LOGIN ERROR:', error);
  console.error('LOGIN ERROR STACK:', error.stack);

  return res.status(500).json({
    message: error.message
  });
}
};

// Log in an existing user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });

    if (
      user &&
      (await bcrypt.compare(password, user.password))
    ) {
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }

    return res.status(401).json({
      message: 'Invalid email or password'
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// Get all users (admin only; route must use protect and admin middleware)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { registerUser, loginUser, getUsers };
