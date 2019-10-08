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

io.on('authenticated', async socket => {
  const user = socket.decoded_token;

  userSockets.set(user.username, socket);

  const userRooms = await RoomController.userRooms(user.username);
  userRooms.forEach(room => socket.join(room._id.toString()));

  socket.on('create private room', async username => {
    const otherUser = await UserController.findOne({ username });

    const name = user.username + username;
    const room = await RoomController.create(name, 'private', [
      user,
      otherUser,
    ]);

    const otherSocket = userSockets.get(username);

    socket.join(room._id.toString());
    otherSocket.join(name._id.toString());
    otherSocket.emit('joined private room', room);
  });

  socket.on('create public room', async name => {
    const room = await RoomController.create(name, 'public', [user]);
    socket.join(room._id.toString());
  });

  socket.on('invite to public room', async (username, roomId) => {
    const otherUser = await UserController.findOne({ username });
    const room = await RoomController.findById(roomId);

    if (room.type !== 'public') {
      socket.emit('client error', 'Room is not public');
      return;
    }

    room.participants.push(otherUser);
    await RoomController.save(room);

    const userSocket = userSockets.get(username);

    userSocket.join(roomId);
    userSocket.emit('joined public room', room);
    socket.broadcast.to(roomId).emit('user joined', username, user.username);
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

  socket.on('send message', async (roomId, text) => {
    const room = await RoomController.findById(roomId);

    if (!room) {
      socket.emit('client error', 'No such room');
      return;
    }

    const message = await MessageController.create(room, user.id, text);

    socket.broadcast.to(roomId).emit('message', message);
  });
});

module.exports = io;

// Events from server:
//   * name: message
//     args: message <Message>
//
//   * name: client error
//     args: errorMessage <String>
//
//   * name: rename
//     args: name <String>, username<String> (user, who renamed chat)
//
//   * name: user joined
//     args: joinedUsername<String>, joinerUsername<String>
//
//   * name: joined public room
//       (emitted, when user was invited to a public room)
//     args: room<Room>
//
//   * name: joined private room
//       (emitted, when user was invited to a private room)
//     args: room<Room>
//
// Events from client:
//   * name: create private room
//     args: username<String> (user, to create chat with)
//
//   * name: create public room
//     args: name<String> (room name)
//
//   * name: invite to public room
//     args: username<String> (user to invite), roomId<String>
//
//   * name: rename public room
//     args: name<String>, roomId<String>
//
//   * name: send message
//     args: roomId<String>, text<String>
