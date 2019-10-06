'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models/');

const { JWT_SECRET } = process.env;

const createJWT = record => {
  const payload = { id: record._id, username: record.username };
  return jwt.sign(payload, JWT_SECRET);
};

const signUp = async user => {
  const record = await User.create(user);
  const token = createJWT(user);
  return { record, token };
};

const signIn = ctx => async (err, user) => {
  if (err || !user) {
    ctx.throw(401, 'Invalid credentials');
  }

  await ctx.login(user);
  const token = createJWT(user);
  const { body } = ctx;
  body.token = token;
};

module.exports = {
  signUp,
  signIn,
};
