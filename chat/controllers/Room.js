'use strict';

const { RoomModel } = require('../models');

const findById = id => RoomModel.findById(id);

const save = room => room.save();

const create = room => RoomModel.create(room);

module.exports = {
  findById,
  save,
  create,
};
