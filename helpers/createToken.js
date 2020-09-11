const jwt = require('jsonwebtoken');
const { SECRET } = require('../config/config');

// This is a heloper function that creates a token

const createToken = (user, expDate) => {
  let payload = {
    id: user.id,
  };

  return jwt.sign(payload, SECRET, { expiresIn: expDate });
};

module.exports = createToken;
