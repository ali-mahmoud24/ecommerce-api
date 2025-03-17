const jwt = require('jsonwebtoken');

const createToken = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

module.exports = {
  createToken,
};
