'use strict';

const { Schema, model } = require('mongoose');
const { Types } = Schema;

const RoomSchema = new Schema({
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
        },
        username: {
          type: String,
        },
      },
    ],
  },
});

const RoomModel = model('Room', RoomSchema);

module.exports = RoomModel;
