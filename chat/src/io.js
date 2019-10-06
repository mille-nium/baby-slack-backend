'use strict';

const socketIo = require('socket.io');
const socketIoJwt = require('socketio-jwt');

const RoomController = require('../controllers/Room');
const UserController = require('../controllers/User');
const MessageController = require('../controllers/Message');

const io = socketIo();

const userSockets = new Map();

io.on(
  'connection',
  socketIoJwt.authorize({
    secret: process.env.JWT_SECRET,
    timeout: process.env.JWT_TIMEOUT,
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
      participants: [user, { id: otherUser._id, username: otherUser.username }],
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
      participants: [user],
    });
    socket.join(room.id);
  });

  socket.on('invite to public room', async (userId, roomId) => {
    const otherUser = await UserController.findById(userId);
    const room = await RoomController.findById(roomId);

    if (room.type !== 'public') {
      socket.emit('client error', 'Room is not public');
      return;
    }

    room.participants.push({ id: userId, username: otherUser.username });
    await RoomController.save(room);

    const userSocket = userSockets.get(userId);

    userSocket.join(roomId);
    userSocket.emit('joined public room', room);
    socket.broadcast
      .to(roomId)
      .emit('user joined', otherUser.username, user.username);
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

  socket.on('send message', async (roomId, data) => {
    const room = await RoomController.findById(roomId);
    const tags = data.match(/@(\w|\.|-){5,22}/g);
    const validTags = tags.filter(tag =>
      room.participants.some(({ username }) => tag.slice(1) === username)
    );
    const taggedUsers = validTags.map(tag => tag.slice(1));

    const isTagMessage = taggedUsers.length > 0;

    await MessageController.create({
      room: roomId,
      type: isTagMessage ? 'tag' : 'text',
      author: user.id,
      body: data,
      taggedUsers,
    });

    socket.broadcast.to(roomId).emit('message', user.username, data, validTags);
  });
});

module.exports = io;
