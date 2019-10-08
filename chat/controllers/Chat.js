'use strict';

const RoomController = require('../controllers/Room');
const UserController = require('../controllers/User');
const MessageController = require('../controllers/Message');

class ChatController {
  constructor(socket, userSockets) {
    this.socket = socket;
    this.userSockets = userSockets;

    this.user = socket.decoded_token;
    this.userId = this.user.id;
    this.username = this.user.username;

    this.userSockets.set(this.user.username, this.socket);
  }

  async joinRooms() {
    const userRooms = await RoomController.userRooms(this.username);
    userRooms.forEach(room => this.socket.join(room._id.toString()));
  }

  async createPrivateRoom(username) {
    const user = await UserController.findOne({ username });

    const name = this.username + username;
    const room = await RoomController.create(name, 'private', [
      this.user,
      user,
    ]);

    const socket = this.userSockets.get(username);

    this.socket.join(room._id.toString());
    socket.join(room._id.toString());
    socket.emit('joined private room', room);
  }

  async createPublicRoom(name) {
    const room = await RoomController.create(name, 'public', [this.user]);
    this.socket.join(room._id.toString());
  }

  async inviteToRoom(username, roomId) {
    const otherUser = await UserController.findOne({ username });
    const room = await RoomController.findById(roomId);

    if (room.type !== 'public') {
      this.socket.emit('client error', 'Room is not public');
      return;
    }

    room.participants.push(otherUser);
    await RoomController.save(room);

    const userSocket = this.userSockets.get(username);

    userSocket.join(roomId);
    userSocket.emit('joined public room', room);
    this.socket.broadcast
      .to(roomId)
      .emit('user joined', username, this.username, room);
  }

  async renameRoom(name, roomId) {
    const room = await RoomController.findById(roomId);

    if (room.type !== 'public') {
      this.socket.emit('client error', 'Room is not public');
      return;
    }

    room.name = name;
    await RoomController.save(room);

    this.socket.broadcast.to(roomId).emit('rename', name, this.username);
  }

  async sendMessage(roomId, text) {
    if (!text) {
      this.socket.emit('client error', 'Empty message');
      return;
    }

    const room = await RoomController.findById(roomId);

    if (!room) {
      this.socket.emit('client error', 'No such room');
      return;
    }

    const message = await MessageController.create(room, this.userId, text);

    this.socket.broadcast.to(roomId).emit('message', message);
  }

  async deleteMessage(messageId) {
    const message = await MessageController.findById(messageId);

    if (!message) {
      this.socket.emit('client error', 'No such message');
      return;
    }

    await MessageController.delete(messageId);

    this.socket.broadcast
      .to(message.room.toString())
      .emit('deleted message', message);
  }

  async editMessage(messageId, text) {
    const message = await MessageController.findById(messageId);

    if (!message) {
      this.socket.emit('client error', 'No such message');
      return;
    }

    message.text = text;
    const room = await RoomController.findById(message.room);
    await MessageController.edit(room, message);

    this.socket.broadcast
      .to(room._id.toString())
      .emit('edited message', message);
  }
}

module.exports = ChatController;
