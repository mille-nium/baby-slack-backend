'use strict';

const { UserModel } = require('../models');

const findById = id => UserModel.findById(id);

module.exports = {
  findById,
};
