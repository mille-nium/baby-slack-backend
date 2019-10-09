'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const dotenv = require('dotenv');

dotenv.config();

const dbInit = require('./src/utils/db');
const errorsHandler = require('./src/middlewares/errors');
const authStrategies = require('./src/utils/auth');
const authRouter = require('./src/routes/auth');
const apiRouter = require('./src/routes/api');

const app = new Koa();

authStrategies();

app.use(bodyParser());
app.use(errorsHandler());
app.use(passport.initialize());
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

dbInit()
  .then(() => app.listen(process.env.PORT))
  .catch(console.error);
