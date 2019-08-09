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

router.post('/user/:id', function(req, res, next) {
  var id = req.params.id
  var dataUpdate;
  var i=0;
  req.body.forEach(function(e, index){
    dataUpdate += req.body[index]+' = "'+e+'"';
    if(i!=req.body.length) dataUpdate += ', ';
    i++
  })
  connection.query(`
    UPDATE set
    ${dataUpdate} 
    WHERE id = ${id}
  `,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json({notice: 'Actualizado'}); 
    }                  
  });
  
});

module.exports = router;
