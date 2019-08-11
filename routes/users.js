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

router.get('/user/:id', function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT * FROM users WHERE id = ${req.params.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json(rows); 
    }                  
  });
  
});

router.post('/user', function(req, res, next) {
  
  var dataUpdate = '';
  var i=0;
  for(var key in req.body){
    if(key != 'id') {
      dataUpdate += key +" = '"+req.body[key]+"'";
      if(i!=Object.keys(req.body).length-1) dataUpdate += ', ';
    }
    i++
  }
  
  connection.query(`UPDATE users SET ${dataUpdate} WHERE id = ${req.body.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json({notice: 'Updated'}); 
    }                  
  });
  
});

router.post('/user/create', function(req, res, next) {

  var columns = '';
  var values = '';
  var i=0;
  for(var key in req.body){
    if(key != 'id') {
      columns += key 
      values += "'"+req.body[key]+"'";
      if(i!=Object.keys(req.body).length-1) {columns += ', ';values += ', ';}
    }
    i++
  }
  connection.query(`INSERT INTO users (${columns}) VALUES (${values})`,function(err,rows){
    if(err){
      if(err.code == 'ER_DUP_ENTRY') res.json({error: 'Username or Email in use!'}); 
      console.log(err)
      res.status(500);   
    }else{
        return res.json({notice: 'User created'}); 
    }                  
  });
  
});

module.exports = router;
