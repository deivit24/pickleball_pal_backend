const express = require('express');
const ExpressError = require('../../helpers/expressError');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const router = new express.Router();
const { userValidators } = require('../../validators/users');
const { isAuth } = require('../../middleware/auth');
const createToken = require('../../helpers/createToken');
const User = require('../../models/User');

const gravatar = require('gravatar');
const normalize = require('normalize-url');

const cloudinary = require('cloudinary').v2;

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
cloudinary.config({
  cloud_name: 'dptksyqdf',
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
const BCRYPT_WORK_FACTOR = 10;
//POST ROUTE api/users
//Register user
router.post('/', userValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array(), 400);
    }

    const { first_name, last_name, email, password } = req.body;

    //See if user exists
    let user = await User.findOne({ email });
    if (user) {
      throw new ExpressError(
        `There already exists a user with username '${email}`,
        400
      );
    }
    //Get Gravatar
    const avatar = normalize(
      gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      }),
      { forceHttps: true }
    );

    user = new User({
      first_name,
      last_name,
      avatar,
      email,
      password,
    });
    //Encrypt Password,
    user.password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    await user.save();
    //return JSONWEBTOKEN

    const token = createToken(user, '5 days');

    return res.status(201).json({ token });
  } catch (e) {
    return next(e);
  }
});

// Upload image
router.put('/upload', isAuth, async (req, res, next) => {
  try {
    const file = req.files.image;
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
      if (err) {
        throw new ExpressError(`That is not a photo`, 400);
      }

      let user = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: { avatar: result.secure_url } },
        { new: true, upsert: true }
      );
      return res.json(user);
    });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
