'use strict';

const argon2 = require('argon2');
const owasp = require('owasp-password-strength-test');
const { Schema, model } = require('mongoose');

const errors = require('../errors/');

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
    const testPassword = owasp.test(this.password);

    if (!testPassword.strong) {
      const err = new Error(errors.ERR_WEAK_PASSWORD);
      err.status = 422;
      err.details = testPassword.errors;
      next(err);
    } else {
      this.password = await argon2.hash(this.password);
      next();
    }
  } catch (err) {
    next(err);
  }
});

userSchema.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    const err = new Error(errors.ERR_USERNAME_ALREADY_EXISTS);
    err.status = 422;
    err.details = ['This username already in use'];
    next(err);
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = async function(password) {
  return argon2.verify(this.password, password);
};

const UserModel = model('User', userSchema);

module.exports = UserModel;
