const { check, validationResult } = require('express-validator');

profileValidators = [
  check('level', 'Level is required').not().isEmpty(),
  check('zip', 'Please enter valid zip code').isLength({
    min: 5,
    max: 5,
  }),
];

placesValidators = [
  check('name', 'Name is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
];

locationValidators = [
  check('zip', 'Please enter valid zip code').isLength({
    min: 5,
    max: 5,
  }),
];

module.exports = { profileValidators, placesValidators, locationValidators };
