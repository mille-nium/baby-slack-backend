'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const dotenv = require('dotenv');

dotenv.config();

const server = require('./src/server');
const connectDB = require('./src/connect-db');

connectDB().catch(console.error);

const app = new Koa();

app.use(bodyParser());

server.on('request', app.callback());
server.listen(3001);
