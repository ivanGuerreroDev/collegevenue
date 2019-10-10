"use strict";

var _expoServerSdk = _interopRequireDefault(require("expo-server-sdk"));

var _multer = _interopRequireDefault(require("multer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Create a new Expo SDK client
let expo = new _expoServerSdk.default();

const express = require('express');

const router = express.Router();

const path = require('path');

var passport = require('passport');

var connection = require('../config/db');

var bcrypt = require('bcrypt');

module.exports = function (pushToken, message, data) {
  let messages = [];
  messages.push({
    to: pushToken,
    sound: 'default',
    body: message,
    data: data
  });
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};