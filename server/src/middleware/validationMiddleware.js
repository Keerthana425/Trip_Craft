export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400);
    const messages = error.errors.map(err => err.message).join(', ');
    next(new Error(messages));
  }
};
