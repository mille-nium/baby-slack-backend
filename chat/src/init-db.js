'use strict';

const { connect } = require('mongoose');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

module.exports = () => connect(process.env.DBURL, options);
