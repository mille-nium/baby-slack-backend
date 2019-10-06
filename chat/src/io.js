'use strict';

const socketIo = require('socket.io');
const socketIoJwt = require('socketio-jwt');

const RoomController = require('../controllers/Room');
const UserController = require('../controllers/User');
const MessageController = require('../controllers/Message');

const io = socketIo();

module.exports = io;

const userSockets = new Map();

io.on(
  'connection',
  socketIoJwt.authorize({
    secret: process.env.JWT_SECRET,
  })
);

io.on('authenticated', socket => {
  const user = socket.decoded_token;

  userSockets.set(user.id, socket);

  socket.on('create private room', async otherUserId => {
    const otherUser = await UserController.findById(otherUserId);

    const name = user.id + otherUserId;
    const room = await RoomController.create({
      name,
      type: 'private',
      participants: [
        { id: user.id, username: user.username },
        { id: otherUser.id, username: otherUser.username },
      ],
    });

    const otherSocket = userSockets.get(otherUserId);

    socket.join(room.id);
    otherSocket.join(room.id);
    otherSocket.emit('join private room', room);
  });

  socket.on('create public room', async name => {
    const room = await RoomController.create({
      name,
      type: 'public',
      participants: [{ id: user.id, username: user.username }],
    });
    socket.join(room.id);
  });

  socket.on('invite to public room', async (userId, roomId) => {
    const user = await UserController.findById(userId);
    const room = await RoomController.findById(roomId);

    if (room.type !== 'public') {
      socket.emit('client error', 'Room is not public');
      return;
    }

    room.participants.push({ id: userId, username: user.username });
    await RoomController.save(room);

    const userSocket = userSockets.get(userId);

    userSocket.join(roomId);
    userSocket.emit('joined public room', room);
    socket.broadcast.to(roomId).emit('user joined', user.username);
  });

  socket.on('rename public room', async (name, roomId) => {
    const room = await RoomController.findById(roomId);

    if (room.type !== 'public') {
      socket.emit('client error', 'Room is not public');
      return;
    }

    room.name = name;
    await RoomController.save(room);

    socket.broadcast.to(roomId).emit('rename', name, user.username);
  });

  socket.on('send message', async (roomId, data, isTag) => {
    socket.broadcast.to(roomId).emit('message', user.username, data);

    await MessageController.create({
      room: roomId,
      type: isTag ? 'tag' : 'text',
      author: user.id,
      body: data,
    });
  });
});
