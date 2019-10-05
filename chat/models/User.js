'use strict';

const { Schema, model } = require('mongoose');

const user = new Schema({
  username: {
    type: String,
    unique: 'User already exists',
    required: 'Property "username" is required',
  },
  password: {
    type: String,
    required: 'Property "password" is required',
  },
});

module.exports = {
  UserModel: model('User', user),
};
