'use strict';

const { Schema, model } = require('mongoose');
const { Types } = Schema;

const room = new Schema({
  name: {
    type: String,
    required: 'Property "name" is required',
  },
  type: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
  },
  participants: {
    type: [
      {
        id: {
          type: Types.ObjectId,
          ref: 'User',
          required: 'Property "id" is required',
        },
        username: {
          type: String,
          required: 'Property "username" is required',
        },
      },
    ],
  },
});

const Room = model('Room', room);

module.exports = Room;
