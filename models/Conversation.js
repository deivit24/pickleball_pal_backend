const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  members: [
    {
      users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    },
  ],
});

module.exports = Conversation = mongoose.model(
  'conversation',
  ConversationSchema
);
