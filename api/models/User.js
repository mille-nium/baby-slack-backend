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
    validate: {
      validator: v => /^[\w_.-]{5,32}$/.test(v),
      message: props => `${props.value} is not a valid username`,
    },
  },
  password: {
    type: String,
    required: 'Property "password" is required',
    validate: {
      validator: v => owasp.test(v).strong,
    },
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

userSchema.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    const error = new Error(errors.ERR_USERNAME_ALREADY_EXISTS);
    error.status = 422;
    error.details = ['This username already in use'];
    next(error);
  } else if (err.name === 'ValidationError') {
    const error = new Error(errors.ERR_INVALID_CREDENTIALS);
    error.status = 422;
    error.details = [];
    const errorValues = Object.keys(err.errors);

    if (errorValues.includes('password')) {
      const { errors } = owasp.test(doc.password);
      error.details = error.details.concat(errors);
    }

    if (errorValues.includes('username')) {
      const { message } = err.errors.username;
      error.details.push(message);
    }

    next(error);
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = async function(password) {
  return argon2.verify(this.password, password);
};

const UserModel = model('User', userSchema);

module.exports = UserModel;
