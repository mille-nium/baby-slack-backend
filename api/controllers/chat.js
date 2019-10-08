'use strict';

const { Room } = require('../models/');
const errors = require('../errors/');

const getChats = ctx => async (err, user) => {
  if (err || !user) {
    const err = new Error(errors.ERR_INVALID_JWT);
    err.status = 401;
    err.details = ['Invalid JWT'];
    throw err;
  }

  const userId = user._id;
  const chats = await Room.find(
    {
      participants: { $elemMatch: { id: userId } },
    },
    '_id name type'
  );
  ctx.body = { chats };
};

module.exports = {
  getChats,
};
