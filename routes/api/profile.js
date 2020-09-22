const express = require('express');
const router = new express.Router();
const { isAuth } = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const Messages = require('../../models/Messages');
const Conversation = require('../../models/Conversation');
const Post = require('../../models/Post');
const { validationResult } = require('express-validator');
const {
  profileValidators,
  placesValidators,
  locationValidators,
} = require('../../validators/profile');
const User = require('../../models/User');
const ExpressError = require('../../helpers/expressError');
const profile = require('../../validators/profile');
const NodeGeocoder = require('node-geocoder');
const normalize = require('normalize-url');

const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

let options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: GEOCODE_API_KEY,
  formatter: null,
};

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dptksyqdf',
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
let geocoder = NodeGeocoder(options);
//GET ROUTE api/profile/me
//Get current users profile
router.get('/me', isAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['first_name', 'last_name', 'avatar']);

    if (!profile) {
      throw new ExpressError(`There is no profile for this user`, 400);
    }
    return res.json(profile);
  } catch (e) {
    next(e);
  }
});

//GET ROUTE api/profile/messages
//Get current users profile
router.get('/messages', isAuth, async (req, res, next) => {
  try {
    const conversation = await Conversation.find({
      members: {
        $elemMatch: { users: req.user.id },
      },
    });
    if (!conversation) {
      throw new ExpressError(`Sorry there is no conversation yet`, 400);
    }
    let ids = [];
    conversation.forEach((element) => {
      ids.push(element.id);
    });

    const messages = await Messages.find()
      .where('conversation_id')
      .in(ids)
      .populate('user', ['first_name', 'last_name', 'avatar'])
      .sort({ updatedAt: -1 })
      .limit(20);

    if (!messages) {
      throw new ExpressError(`There is no messages for this user`, 400);
    }
    // Accepts the array and key
    const groupBy = (array, key) => {
      // Return the end result
      return array.reduce((result, currentValue) => {
        // If an array already present for key, push it to the array. Else create an array and push the object
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
          currentValue
        );
        // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
        return result;
      }, {}); // empty object is the initial value for result object
    };
    const groupedMessages = groupBy(messages, 'conversation_id');

    const newMessages = Object.keys(groupedMessages).map(function (key, index) {
      return groupedMessages[key];
    });

    return res.json(newMessages);
  } catch (e) {
    next(e);
  }
});

//POST Route api/profile
//Create or Update User Profile
router.post('/', isAuth, profileValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array(), 400);
    }
    const {
      gender,
      level,
      active,
      bio,
      playing_tyle,
      years_playing,
      facebook,
      instagram,
      linkedin,
      zip,
    } = req.body;

    const geo = await geocoder.geocode(zip);
    let location = geo[0].formattedAddress;
    let lat = geo[0].latitude;
    let lng = geo[0].longitude;
    const profileFields = {
      user: req.user.id,
      gender,
      level,
      active,
      bio,
      playing_tyle,
      years_playing,
      location: {
        zip,
        location,
        lat,
        lng,
      },
    };

    const socialfields = {
      instagram,
      linkedin,
      facebook,
    };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;
    // let profile = await Profile.findOne({ user: req.user.id });
    // if (profile) {
    //   //update
    //   profile = await Profile.findOneAndUpdate(
    //     { user: req.user.id },
    //     { $set: profileFields },
    //     { new: true, upsert: true }
    //   );

    //   return res.json(profile);
    // }

    // // create
    // profile = new Profile(profileFields);
    // await profile.save();
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    return res.json(profile);
  } catch (e) {
    next(e);
  }
});

//GET Route api/profile
//Get All profiles

router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let userSearch = {
      'location.location': new RegExp(search, 'i'),
    };

    let profiles;

    if (search) {
      profiles = await Profile.find(userSearch)
        .sort('level')
        .populate('user', ['first_name', 'last_name', 'avatar']);
    } else {
      profiles = await Profile.find()
        .sort('-level')
        .populate('user', ['first_name', 'last_name', 'avatar']);
    }

    return res.json(profiles);
  } catch (e) {
    next(e);
  }
});

//GET Route api/profile/user/:user_id
//Get profile by user ID

router.get('/user/:user_id', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['first_name', 'last_name', 'avatar']);

    if (!profile) {
      throw new ExpressError(`There is no profile for this user`, 400);
    }
    return res.json(profile);
  } catch (e) {
    if (e.kind == 'ObjectId') {
      return res.status(400).json({
        error: { msg: 'profile not found' },
      });
    }
    next(e);
  }
});

//DELETE Route api/profile
//deletes profile, user and posts if any

router.delete('/', isAuth, async (req, res, next) => {
  try {
    console.log(req.user);

    await Post.deleteMany({ user: req.user.id });
    await Messages.deleteMany({ user: req.user.id });
    await Profile.findOneAndRemove({ user: req.user.id });

    await User.findOneAndRemove({ _id: req.user.id });
    return res.json({ msg: 'User deleted' });
  } catch (e) {
    next(e);
  }
});

//PUT Route api/profile/places
//add profile places

router.put('/places', isAuth, placesValidators, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ExpressError(errors.array(), 400);
    }

    const { name } = req.body;
    const geo = await geocoder.geocode(req.body.location);
    let location = geo[0].formattedAddress;
    let lat = geo[0].latitude;
    let lng = geo[0].longitude;
    const newPlaces = {
      name,
      location,
      lat,
      lng,
    };
    const profile = await Profile.findOne({ user: req.user.id });

    profile.places.unshift(newPlaces);
    await profile.save();
    return res.json(profile);
  } catch (e) {
    next(e);
  }
});

//DELETE ROUTE api/profile/places/:exp_id
router.delete('/places/:exp_id', isAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    const removeIndex = profile.places
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.places.splice(removeIndex, 1);
    await profile.save();

    return res.json(profile);
  } catch (e) {
    next(e);
  }
});
module.exports = router;

//POST Route api/profile/user/:user_id
//Post a message

router.post('/:user_id', isAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['first_name', 'last_name', 'avatar']);

    if (!profile) {
      throw new ExpressError(`There is no profile for this user`, 400);
    }

    const conversation = await Conversation.findOne({
      $and: [
        { members: { $elemMatch: { users: req.params.user_id } } },
        { members: { $elemMatch: { users: req.user.id } } },
      ],
    });
    if (!conversation) {
      throw new ExpressError(`Sorry there is no conversation yet`, 400);
    }

    const newMessage = new Messages({
      conversation_id: conversation._id,
      message: req.body.message,
      sender_id: req.user.id,
      receiver_id: req.params.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      rec_first_name: profile.user.first_name,
      rec_last_name: profile.user.last_name,
      avatar: user.avatar,
    });
    const message = await newMessage.save();

    return res.json(message);
  } catch (e) {
    console.log(e);
    if (e.kind == 'ObjectId') {
      return res.status(400).json({
        error: { msg: 'profile not found' },
      });
    }
    next(e);
  }
});

//Conversation and Messages Route

//POST Route api/profile/user/:user_id/conversation
//Create a new Conversation

router.post('/user/:user_id/conversation', isAuth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['first_name', 'last_name', 'avatar']);

    if (!profile) {
      throw new ExpressError(`There is no profile for this user`, 400);
    }
    const checkConversation = await Conversation.findOne({
      $and: [
        { members: { $elemMatch: { users: req.params.user_id } } },
        { members: { $elemMatch: { users: req.user.id } } },
      ],
    });

    if (checkConversation) {
      throw new ExpressError(
        `You already started a conversation with this user`,
        400
      );
    }

    const newConversation = new Conversation({
      members: [{ users: req.user.id }, { users: req.params.user_id }],
    });
    const conversation = await newConversation.save();

    return res.json(conversation);
  } catch (e) {
    if (e.kind == 'ObjectId') {
      return res.status(400).json({
        error: { msg: 'profile not found' },
      });
    }
    next(e);
  }
});

//POST Route api/profile/user/:user_id
//Post a message

// router.post(
//   '/user/:user_id/conversation/new',
//   isAuth,
//   async (req, res, next) => {
//     try {
//       const user = await User.findById(req.user.id).select('-password');
//       const profile = await Profile.findOne({
//         user: req.params.user_id,
//       }).populate('user', ['first_name', 'last_name', 'avatar']);

//       if (!profile) {
//         throw new ExpressError(`There is no profile for this user`, 400);
//       }

//       const conversation = await Conversation.findOne({
//         members: {
//           $elemMatch: { users: req.params.user_id, users: req.user.id },
//         },
//       });
//       if (!conversation) {
//         throw new ExpressError(`Sorry there is no conversation yet`, 400);
//       }
//       const newMessage = new Messages({
//         conversation_id: conversation._id,
//         message: req.body.message,
//         sender_id: req.user.id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         avatar: user.avatar,
//       });
//       const message = await newMessage.save();

//       return res.json(message);
//     } catch (e) {
//       if (e.kind == 'ObjectId') {
//         return res.status(400).json({
//           error: { msg: 'profile not found' },
//         });
//       }
//       next(e);
//     }
//   }
// );
