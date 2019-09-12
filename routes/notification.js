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

router.post("/login",function(req,res,next){
    let messages = [];
    messages.push({
        to: req.body.token.value,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
    },
    {
        to: req.body.token.value,
        sound: 'default',
        body: 'This is a test notification2',
        data: { withSome: 'data' },
    },{
        to: req.body.token.value,
        sound: 'default',
        body: 'This is a test notification3',
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

})


module.exports = router;