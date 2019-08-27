const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

router.post("/createfollow", function(req, res){

    var values = '', indexs = '';
    let i = 0;
    for(var key in req.body){
        if(key == 'text' /*|| key == 'media'*/){values += "'"+req.body[key]+"'"; indexs+= key;}
        else{values += req.body[key]; indexs+= key;}
        if(i != Object.keys(req.body).length-1){values += ', '; indexs+= ', ';}
        i++
    };
    
    connection.query(`
        INSERT INTO follows
        (${indexs})
        VALUES (${values})  
    `,function(err,rows){
        console.log(err)
        if(err) return res.json({valid:false, error:'Error'})
        if(rows) return res.json({
            valid: true
        })
    })
})

router.post('/getfollowersByID', function(req, res, next) {
    // GET/users/ route
    connection.query(`SELECT * FROM follows
    WHERE 
    id_user = ${req.body.user} 
    `, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

router.post('/deletefollow', function(req, res, next) {
    // GET/users/ route
    connection.query(`DELETE FROM follows
    WHERE 
    id_user = ${req.body.user} &&
    follow = ${req.body.follow}
    `, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

  router.post('/mightKnow', function(req, res, next) {
    // GET/users/ route
    connection.query(`SELECT users.id, profiles.id, users.firstName, users.surname, users.correo, profiles.avatar 
    FROM users 
    INNER JOIN follows ON users.id = follows.follow AND follows.user_id IN 
      ( SELECT follows.follow FROM follows WHERE follows.user_id = ${req.body.user} ) 
      AND follows.follow NOT IN 
        ( SELECT follows.follow FROM follows WHERE follows.user_id = ${req.body.user}) INNER JOIN profiles ON users.id = profiles.user_id
    `, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

module.exports = router;