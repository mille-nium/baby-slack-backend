'use strict';

const { Room, Message } = require('../models/');
const errors = require('../errors/');

const MSG_LIMIT = 50;

const getChat = (ctx, chatId) => async (err, user) => {
  if (err || !user) {
    const err = new Error(errors.ERR_INVALID_JWT);
    err.status = 401;
    err.details = ['Invalid JWT'];
    throw err;
  }

  const chat = await Room.findOne({ _id: chatId });
  ctx.body = { chat };
};

const getChats = ctx => async (err, user) => {
  if (err || !user) {
    const err = new Error(errors.ERR_INVALID_JWT);
    err.status = 401;
    err.details = ['Invalid JWT'];
    throw err;
  }

  const userId = user._id;
  const chats = await Room.find(
    {
      participants: { $elemMatch: { id: userId } },
    },
    '_id name type'
  );
  ctx.body = { chats };
};

const getMessages = (ctx, chatId, ms) => async (err, user) => {
  if (err || !user) {
    const err = new Error(errors.ERR_INVALID_JWT);
    err.status = 401;
    err.details = ['Invalid JWT'];
    throw err;
  }

  const messages = await Message.find({
    room: chatId,
    createdAt: { $lt: ms },
  }).limit(MSG_LIMIT);
  ctx.body = { messages };
};

module.exports = {
  getChat,
  getChats,
  getMessages,
};
