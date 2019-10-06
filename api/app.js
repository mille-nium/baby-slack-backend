'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const dotenv = require('dotenv');

dotenv.config();

const dbInit = require('./utils/db');
const errorsHandler = require('./middlewares/errors');
const authStrategies = require('./utils/auth');
const authRouter = require('./routes/auth');

dbInit();
authStrategies();

const app = new Koa();

app.use(bodyParser());
app.use(errorsHandler());
app.use(passport.initialize());
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.listen(3000);
