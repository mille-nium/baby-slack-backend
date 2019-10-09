'use strict';

const Router = require('koa-router');
const passport = require('koa-passport');
const UserController = require('../controllers/user');

const routerOpts = { prefix: '/auth' };
const router = new Router(routerOpts);

router.post('/sign-up', async ctx => {
  const user = ctx.request.body;
  const token = await UserController.signUp(user);
  // eslint-disable-next-line require-atomic-updates
  ctx.body = { token };
});

router.post('/sign-in', async (ctx, next) => {
  const authenticate = await passport.authenticate(
    'local',
    { session: false },
    UserController.signIn(ctx)
  );
  await authenticate(ctx, next);
});

module.exports = router;
