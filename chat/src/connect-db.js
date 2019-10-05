'use strict';

const { connect } = require('mongoose');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = () => connect(process.env.DBURL, options);
