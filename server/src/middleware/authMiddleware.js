import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token = req.cookies.token;

  // Fallback: check Authorization Bearer header if cookie is missing (e.g. cross-domain restrictions)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'tripcraft_fallback_secret_key_987654!';
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token found'));
  }
};
