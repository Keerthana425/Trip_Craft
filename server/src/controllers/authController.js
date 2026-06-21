import User from '../models/User.js';
import { generateToken, clearToken } from '../utils/token.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email or username'));
    }

    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        message: 'Registration successful! Proceed to authentication.',
        _id: user._id,
        username: user.username,
        email: user.email
      });
    } else {
      res.status(400);
      next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(res, user._id);
      res.json({
        token,
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic
      });
    } else {
      res.status(401);
      next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res, next) => {
  try {
    clearToken(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    if (req.user) {
      res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePic: req.user.profilePic
      });
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};
