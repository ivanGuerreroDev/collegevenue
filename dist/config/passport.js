"use strict";

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var bcrypt = require('bcrypt');

var connection = require('../config/db');

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  }); // used to deserialize the user

  passport.deserializeUser(function (id, done) {
    connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
      done(err, rows[0]);
    });
  });
  passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: "correo",
    passwordField: "password"
  }, function (req, username, password, done) {
    console.log(username);
    console.log(password);
    connection.query("SELECT * FROM users WHERE correo = ?", [username], function (err, rows) {
      if (err) return done(err);

      if (!rows.length) {
        return done(null, false, {
          message: 'Email not exist'
        }); // req.flash is the way to set flashdata using connect-flash
      }

      if (rows[0].privilege != 'admin') {
        return done(null, false, {
          message: 'You are not admin!'
        });
      }

      if (!bcrypt.compareSync(password, rows[0].password)) return done(null, false, {
        message: 'Password incorrect'
      }); // create the loginMessage and save it to session as flashdata

      return done(null, rows[0]);
    });
  }));
};