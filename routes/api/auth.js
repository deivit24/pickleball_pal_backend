const express = require('express');
const router = new express.Router();
const { isAuth } = require('../../middleware/auth');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const ExpressError = require('../../helpers/expressError');
const { loginValidators } = require('../../validators/users');
const createToken = require('../../helpers/createToken');

//GET ROUTE api/auth
router.get('/', isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json(user);
  } catch (e) {
    next(e);
  }
});

//POST ROUTE api/auth
//Authenticate user and get token
router.post('/', loginValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array(), 400);
    }

    const { email, password } = req.body;

    //See if user exists
    let user = await User.findOne({ email });
    if (!user) {
      throw new ExpressError(`Invalid Credentials`, 400);
    }

    //compare passwords
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new ExpressError(`Invalid Credentials `, 400);
    }
    //return JSONWEBTOKEN

    const token = createToken(user, '5d');

    return res.status(201).json({ token });
  } catch (e) {
    return next(e);
  }
});
module.exports = router;
