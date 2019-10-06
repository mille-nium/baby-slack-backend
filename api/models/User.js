'use strict';

const argon2 = require('argon2');
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
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

userSchema.pre('save', async function(next) {
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.verifyPassword = async function(password) {
  return password && argon2.verify(this.password, password);
};

const UserModel = model('User', userSchema);

module.exports = UserModel;
