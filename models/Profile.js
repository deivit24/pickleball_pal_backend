const mongoose = require('mongoose');

const default_img =
  'https://icon-library.com/images/default-user-icon/default-user-icon-4.jpg';

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  image: {
    type: String,
    default: default_img,
  },
  gender: { type: String },
  level: { type: String },
  active: { type: Boolean },
  bio: { type: String },
  playing_tyle: { type: String },
  location: [
    {
      zip: {
        type: Number,
        required: true,
      },
      location: { type: String },
      createdAt: { type: Date, default: Date.now },
      lat: { type: Number },
      lng: { type: Number },
    },
  ],
  years_playing: { type: Number },
  places: [
    {
      name: {
        type: String,
        required: true,
      },
      location: { type: String },
      createdAt: { type: Date, default: Date.now },
      lat: { type: Number },
      lng: { type: Number },
    },
  ],
  social: {
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
  },
  date: { type: String, default: Date.now },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
