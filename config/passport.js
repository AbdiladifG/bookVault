// config/passport.js

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  async function(req, email, password, done) {
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ 'local.email': email });
      if (existingUser) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
      }

      // Create a new user if email is not taken
      const newUser = new User();
      newUser.local.email = email;
      newUser.local.password = newUser.generateHash(password); // use the generateHash function in our user model

      await newUser.save();
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  async function(req, email, password, done) {
    try {
      // Find the user by email
      const user = await User.findOne({ 'local.email': email });
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }

      // Check if the password is correct
      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      }

      // All is well, return successful user
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};
