'use strict';

const dotenv = require('dotenv');

const io = require('./src/io');
const initDB = require('./src/init-db');

dotenv.config();

initDB()
  .then(() => io.listen(3001))
  .catch(console.error);
