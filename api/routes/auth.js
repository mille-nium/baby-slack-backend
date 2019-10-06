'use strict';

const Router = require('koa-router');
const passport = require('koa-passport');
const UserController = require('../controllers/user');

const routerOpts = { prefix: '/auth' };
const router = new Router(routerOpts);

router.post('/sign-up', async ctx => {
  const user = ctx.request.body;
  const { record, token } = await UserController.signUp(user);
  await ctx.login(record);
  const { body } = ctx;
  body.token = token;
});

router.post('/sign-in', async (ctx, next) => {
  const authenticate = await passport.authenticate(
    'local',
    { session: false },
    UserController.signIn(ctx)
  );
  authenticate(ctx, next);
});

module.exports = router;
