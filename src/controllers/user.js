'use strict';

const jwt = require('jsonwebtoken');

const { User, Room } = require('../models/');
const errors = require('../errors/');

const { JWT_SECRET } = process.env;

const createJWT = record => {
  const payload = { id: record._id, username: record.username };
  return jwt.sign(payload, JWT_SECRET);
};

const signUp = async user => {
  const record = await User.create(user);
  return createJWT(record);
};

const signIn = ctx => async (err, user) => {
  if (err || !user) {
    const err = new Error(errors.ERR_INVALID_CREDENTIALS);
    err.status = 401;
    err.details = ['Invalid username or password'];
    throw err;
  }

  const token = createJWT(user);
  ctx.body = { token };
};

const getUninvitedUsers = (ctx, chatId) => async (err, user) => {
  if (err || !user) {
    const err = new Error(errors.ERR_INVALID_JWT);
    err.status = 401;
    err.details = ['Invalid JWT'];
    throw err;
  }

  const participants = await Room.findOne({ _id: chatId }).map(room =>
    room.participants.map(user => user.id)
  );
  const uninvitedUsers = await User.find(
    { _id: { $nin: participants } },
    '_id username'
  );
  ctx.body = { users: uninvitedUsers };
};

module.exports = {
  signUp,
  signIn,
  getUninvitedUsers,
};
