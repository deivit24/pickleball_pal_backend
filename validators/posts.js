const { check, validationResult } = require('express-validator');

postValidators = [check('text', 'text is required').not().isEmpty()];

module.exports = { postValidators };
