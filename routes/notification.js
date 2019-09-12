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

router.get("/notification",function(req,res,next){

    console.log(req);

})


module.exports = router;