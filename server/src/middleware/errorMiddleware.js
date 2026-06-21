// Catch-all route for unmatched paths (404)
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const key = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${key}. Please use another value.`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
