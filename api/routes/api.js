'use strict';

const Router = require('koa-router');
const passport = require('koa-passport');

const ChatController = require('../controllers/chat');
const UserController = require('../controllers/user');

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

router.get('/chats/:chatId', async (ctx, next) => {
  const { chatId } = ctx.params;
  const authenticate = await passport.authenticate(
    'jwt',
    { session: false },
    ChatController.getChat(ctx, chatId)
  );
  await authenticate(ctx, next);
});

router.get('/:chatId/messages/:ms', async (ctx, next) => {
  const { chatId, ms } = ctx.params;
  const authenticate = await passport.authenticate(
    'jwt',
    { session: false },
    ChatController.getMessages(ctx, chatId, ms)
  );
  await authenticate(ctx, next);
});

router.get('/:chatId/uninvited-users', async (ctx, next) => {
  const { chatId } = ctx.params;
  const authenticate = await passport.authenticate(
    'jwt',
    { session: false },
    UserController.getUninvitedUsers(ctx, chatId)
  );
  await authenticate(ctx, next);
});

module.exports = router;
