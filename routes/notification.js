import Expo from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();
const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport') 
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

module.exports = function(pushToken,message){
    let messages = [];
    messages.push({
    to: pushToken,
    sound: 'default',
    body: message,
    data: { withSome: 'data' },
    })
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

}


module.exports = router;