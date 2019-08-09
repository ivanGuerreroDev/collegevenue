const express = require('express');
const router = express.Router();
const config = require('../config.js');
const path = require('path');
var connection  = require('../config/db');
import { Store } from "../src/flux";
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
})

router.get('/users', function(req, res, next) {
  // GET/users/ route
  connection.query('SELECT * FROM users',function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json(rows); 
    }                  
  });
  
});

module.exports = router;
