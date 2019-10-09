'use strict';

const { User } = require('../models');

const findById = id => User.findById(id);

module.exports = {
  findById,
};
