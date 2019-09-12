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

    console.log(req.body.token.value);

    pushToken = req.body.token.value;

    messages.push({
        to: pushToken,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
      });

})


module.exports = router;