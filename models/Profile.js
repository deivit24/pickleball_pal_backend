const mongoose = require('mongoose');
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching-v2/index.js');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
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

ProfileSchema.plugin(mongoose_fuzzy_searching, {
  fields: ['gender'],
});
module.exports = Profile = mongoose.model('profile', ProfileSchema);
