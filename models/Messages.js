const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessagesSchema = new Schema({
  conversation_id: {
    type: Schema.Types.ObjectId,
    ref: 'conversation',
  },
  message: {
    type: String,
    required: true,
  },
  date_sent: {
    type: Date,
    default: Date.now,
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  receiver_id: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  rec_first_name: {
    type: String,
  },
  rec_last_name: {
    type: String,
  },
  avatar: {
    type: String,
  },
});

module.exports = Messages = mongoose.model('messages', MessagesSchema);
