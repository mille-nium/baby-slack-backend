'use strict';

const {
  Types: { ObjectId },
} = require('mongoose');
const { MessageModel } = require('../models');

const create = (room, authorId, text) => {
  const tags = text.match(/@(\w|\.|-){5,22}/g);
  const validTags = tags.filter(tag =>
    room.participants.some(({ username }) => tag.slice(1) === username)
  );
  const taggedUsers = validTags.map(tag => tag.slice(1));

  return MessageModel.create({
    room: room.id,
    type: taggedUsers.length ? 'tag' : 'text',
    author: ObjectId(authorId),
    text,
    taggedUsers,
  });
};

module.exports = {
  create,
};
