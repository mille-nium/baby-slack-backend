'use strict';

const { connect } = require('mongoose');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

const initDB = () =>
  connect(
    process.env.DBURL,
    options
  );

module.exports = {
  initDB,
};
