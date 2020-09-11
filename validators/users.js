const { check, validationResult } = require('express-validator');

userValidators = [
  check('first_name', 'First Name is required').not().isEmpty(),
  check('last_name', 'Last Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a minimum of 6 characters').isLength({
    min: 6,
  }),
];

loginValidators = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

module.exports = { userValidators, loginValidators };
