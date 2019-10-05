'use strict';

const { Schema, model } = require('mongoose');
const { Types } = Schema;

const message = new Schema({
  room: {
    type: Types.ObjectId,
    ref: 'User',
    required: 'Property "room" is required',
  },
  type: {
    type: String,
    values: ['tag', 'text'],
    default: 'text'
  },
  author: {
    type: Types.ObjectId,
    ref: 'User',
  },
  body: {
    type: String,
    required: 'Property "body" is required',
  },
});

module.exports = {
  MessageModel: model('Message', message),
};
