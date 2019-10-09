'use strict';

const user = {
  ERR_INVALID_CREDENTIALS: 600,
  ERR_USERNAME_ALREADY_EXISTS: 601,
};

const errors = {
  ...user,
  ERR_INVALID_JWT: 602,
};

module.exports = errors;
