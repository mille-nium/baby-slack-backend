'use strict';

const http = require('http');
const IO = require('socket.io');
const socketioJwt = require('socketio-jwt');

const models = require('../models');

const server = http.createServer();
const io = new IO(server);

const userSockets = new Map();

io.on('connection', socketioJwt.authorize({
  secret: 'secret',
}));

io.on('authenticated', socket => {
  const user = socket.decoded_token;

  userSockets.set(user.id, socket);

  socket.on('create private room', async otherUserId => {
    const otherUser = await models.UserModel.findById(otherUserId);

    const room = await models.RoomModel.create({
      name: user.id + otherUserId,
      type: 'private',
      participants: [
        { id: user.id, username: user.username },
        { id: otherUserId, username: otherUser.username },
      ],
    });

    const otherSocket = userSockets.get(otherUserId);

    socket.join(room.id);
    otherSocket.join(room.id);
    otherSocket.emit('join private room', room);
  });

  socket.on('create public room', async name => {
    const room = await models.RoomModel.create({
      name,
      type: 'public',
      participants: [{ id: user.id, username: user.username }],
    });

    socket.join(room.id);
  });

  // roomId - ObjectID in room collection
  socket.on('invite to public room', async (userId, roomId) => {
    const user = await models.UserModel.findById(userId);
    const room = await models.RoomModel.findById(roomId);

    room.participants.push({ id: userId, username: user.username });
    room.save();

    const userSocket = userSockets.get(userId);

    userSocket.join(roomId);
    userSocket.emit('joined public room', room);
    socket.broadcast.to(roomId).emit('user joined', user.username);
  });

  socket.on('rename public room', async (name, roomId) => {
    await models.RoomModel.updateOne({ id: roomId }, { $set: { name } });
    socket.broadcast.to(roomId).emit('rename', name, user.username);
  });

  // roomId - ObjectID in room collection
  socket.on('send message', async (roomId, data, isTag) => {
    socket.broadcast.to(roomId).emit('message', user.username, data);

    await models.MessageModel.create({
      room: roomId,
      type: isTag ? 'tag' : 'text',
      author: user.id,
      body: data,
    });
  });
});
