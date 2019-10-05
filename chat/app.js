'use strict';

const dotenv = require('dotenv');

const io = require('./src/io');
const connectDB = require('./src/connect-db');

dotenv.config();

connectDB().catch(console.error);

io.listen(3001);
