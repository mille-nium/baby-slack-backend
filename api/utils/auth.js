'use strict';

const passport = require('koa-passport');
const LocalStrategy = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../models');

const authStrategies = () => {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      user ? done(null, user) : done(null, false);
    } catch (err) {
      done(err);
    }
  });

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

  passport.use(jwtStrategy);
  passport.use(localStrategy);
};

module.exports = authStrategies;
