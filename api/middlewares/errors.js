'use strict';

const errorsHandler = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = err.message;
  }
};

module.exports = errorsHandler;
