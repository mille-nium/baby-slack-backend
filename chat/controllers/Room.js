'use strict';

const {
  Types: { ObjectId },
} = require('mongoose');
const { RoomModel } = require('../models');

const find = query => RoomModel.find(query);

const findById = id => RoomModel.findById(id);

const save = room => {
  room.participants = room.participants.map(user => ({
    id: ObjectId(user.id || user._id),
  }));
  return room.save();
};

const create = (name, type, participants) => {
  participants = participants.map(user => ({
    id: ObjectId(user.id || user._id),
  }));
  return RoomModel.create({ name, type, participants });
};

const userRooms = username =>
  RoomModel.find({ participants: { $elemMatch: { username } } });

module.exports = {
  find,
  findById,
  save,
  create,
  userRooms,
};
