'use strict';

const socketIo = require('socket.io');
const socketIoJwt = require('socketio-jwt');

const ChatController = require('../controllers/Chat');

const io = socketIo();

const userSockets = new Map();
const roomSockets = new Map();

io.on(
  'connection',
  socketIoJwt.authorize({
    secret: process.env.JWT_SECRET,
    timeout: process.env.JWT_TIMEOUT,
  })
);

io.on('authenticated', async socket => {
  const controller = new ChatController(socket, userSockets, roomSockets);

  await controller.joinRooms();

  socket.on('create private room', username =>
    controller.createPrivateRoom(username)
  );

  socket.on('create public room', async name =>
    controller.createPublicRoom(name)
  );

  socket.on('invite to room', async (username, roomId) =>
    controller.inviteToRoom(username, roomId)
  );

  socket.on('rename room', async (name, roomId) =>
    controller.renameRoom(name, roomId)
  );

  socket.on('delete room', async roomId =>
    controller.deleteRoom(roomId)
  );

  socket.on('send message', async (roomId, text) =>
    controller.sendMessage(roomId, text)
  );

  socket.on('delete message', async messageId =>
    controller.deleteMessage(messageId)
  );

  socket.on('edit message', async (messageId, text) =>
    controller.editMessage(messageId, text)
  );
});

module.exports = io;
