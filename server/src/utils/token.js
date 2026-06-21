import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'tripcraft_fallback_secret_key_987654!';
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '30d'
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
};

export const clearToken = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};
