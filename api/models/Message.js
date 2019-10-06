'use strict';

const { Schema, model } = require('mongoose');
const { Types } = Schema;

const MessageSchema = new Schema({
  room: {
    type: Types.ObjectId,
    ref: 'User',
    required: 'Property "room" is required',
  },
  type: {
    type: String,
    values: ['tag', 'text'],
    default: 'text',
  },
  author: {
    type: Types.ObjectId,
    ref: 'User',
  },
  body: {
    type: String,
    required: 'Property "body" is required',
  },
  taggedUsers: {
    type: [String],
  },
});

const MessageModel = model('Message', MessageSchema);

module.exports = MessageModel;
