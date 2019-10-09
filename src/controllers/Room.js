'use strict';

const { Room } = require('../models');

const find = query => Room.find(query);

const findById = id => Room.findById(id);

const save = room => {
  room.participants = room.participants.map(user => ({
    id: user.id || user._id,
    username: user.username,
  }));
  return room.save();
};

const create = (name, type, participants) => {
  participants = participants.map(user => ({
    id: user.id || user._id,
    username: user.username,
  }));
  return Room.create({ name, type, participants });
};

const deleteRoom = roomId => Room.deleteOne({ _id: roomId });

const userRooms = username =>
  Room.find({ participants: { $elemMatch: { username } } }, '_id').then(
    roomIds => roomIds.map(roomId => roomId.toString())
  );

module.exports = {
  find,
  findById,
  save,
  create,
  delete: deleteRoom,
  userRooms,
};
