'use strict';

const jwt = require('jsonwebtoken');

const { User } = require('../models/');
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

module.exports = {
  signUp,
  signIn,
};
