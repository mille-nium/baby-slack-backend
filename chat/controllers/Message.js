'use strict';

const { MessageModel } = require('../models');

const create = message => MessageModel.create(message);

module.exports = {
  create,
};
