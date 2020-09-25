const { check, validationResult } = require('express-validator');

postValidators = [
  check('text', 'Can not leave post empty').not().isEmpty(),
  check('text', 'Post must be less than 300 characters').isLength({
    max: 300,
  }),
];

module.exports = { postValidators };
