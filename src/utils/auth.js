'use strict';

const passport = require('koa-passport');
const LocalStrategy = require('passport-local');
const { User } = require('../models');

const authStrategies = () => {
  const localStrategy = new LocalStrategy(
    { session: false },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        const verified = await user.verifyPassword(password);

        if (!user || !verified) {
          return done(null, false);
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  );

  passport.use(localStrategy);
};

module.exports = authStrategies;
