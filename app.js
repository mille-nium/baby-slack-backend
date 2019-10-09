'use strict';

const dotenv = require('dotenv');

dotenv.config();

const io = require('./src/io');
const { initDB } = require('./src/utils');

initDB()
  .then(() => io.listen(process.env.PORT))
  .catch(console.error);
