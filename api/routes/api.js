'use strict';

const Router = require('koa-router');
const passport = require('koa-passport');
const ChatController = require('../controllers/chat');

const routerOpts = { prefix: '/api' };
const router = new Router(routerOpts);

router.get('/chats', async (ctx, next) => {
  const authenticate = await passport.authenticate(
    'jwt',
    { session: false },
    ChatController.getChats(ctx)
  );
  await authenticate(ctx, next);
});

module.exports = router;
