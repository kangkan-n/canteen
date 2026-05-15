const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateJWT = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate 6-digit verification token
const generateVerificationToken = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = { generateJWT, generateVerificationToken };
