const jwt = require('jsonwebtoken');
const { SECRET } = require('../config/config');
const ExpressError = require('../helpers/expressError');

const isAuth = (req, res, next) => {
  const tokenJWT = req.header('x-auth-token');

  try {
    const token = jwt.verify(tokenJWT, SECRET);
    req.user = token;

    next();
  } catch (e) {
    return next(new ExpressError('You must authenticate first', 401));
  }
};

module.exports = {
  isAuth,
};
