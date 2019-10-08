'use strict';

const { RoomModel } = require('../models');

const find = query => RoomModel.find(query);

const findById = id => RoomModel.findById(id);

const save = room => {
  room.participants = room.participants.map(user => ({
    id: user.id || user._id,
  }));
  return room.save();
};

const create = (name, type, participants) => {
  participants = participants.map(user => ({ id: user.id || user._id }));
  return RoomModel.create({ name, type, participants });
};

const deleteRoom = roomId => RoomModel.deleteOne({ _id: roomId });

const userRooms = username =>
  RoomModel.find({ participants: { $elemMatch: { username } } }, '_id').then(
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
