'use strict';

const { MessageModel } = require('../models');

const getTaggedUsers = (text, participants) => text
  .match(/@(\w|\.|-){5,22}/g)
  .map(tag => tag.slice(1))
  .filter(username =>
    participants.some(user => username === user.username)
  );

const findById = id => MessageModel.findById(id);

const create = (room, authorId, text) => {
  const taggedUsers = getTaggedUsers(text, room.participants);

  return MessageModel.create({
    room: room.id,
    type: taggedUsers.length ? 'tag' : 'text',
    author: authorId,
    text,
    taggedUsers,
  });
};

const deleteMessage = message => {
  message.deleted = true;
  return message.save();
};

const edit = (room, message) => {
  const taggedUsers = getTaggedUsers(message.text, room.participants);

  message.type = taggedUsers.length ? 'tag' : 'text';
  message.taggedUsers = taggedUsers;

  return message.save();
};

module.exports = {
  findById,
  create,
  delete: deleteMessage,
  edit,
};
