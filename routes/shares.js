const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';
var moment = require('moment');
var notify = require("./routes/notification");



router.post("/createShare", function(req, res){

    var values = '', indexs = '';
    let i = 0;
    for(var key in req.body){
        if(key == 'text' /*|| key == 'media'*/){values += "'"+req.body[key]+"'"; indexs+= key;}
        else{values += req.body[key]; indexs+= key;}
        if(i != Object.keys(req.body).length-1){values += ', '; indexs+= ', ';}
        i++
    };
    
    indexs+= ', timestamp'; 
    values+=', "'+moment().utc().valueOf()+'"';

    connection.query(`
        INSERT INTO shares
        (${indexs})
        VALUES (${values})  
    `,function(err,rows){
        console.log(err)
        if(err) return res.json({valid:false, error:'Error'})
        if(rows){

          var token;
          var message;
        
            connection.query(`
            SELECT *
            FROM users
            WHERE users.id IN (SELECT posts.user_post
                               FROM posts
                               WHERE posts.id = ${req.body.post_id})
            `, function(err,rows){
            token = rows[0].pushtoken;
                connection.query(`
                SELECT users.firstname, users.surname
                FROM users
                WHERE users.id = ${req.body.user_id}
                `,function(err,rows){
                  message = ''+rows[0].firstname+' '+rows[0].surname+' shared your post';
                  notify(token,message);
                });
            });

          return res.json({valid: true})
      }
    })
})

router.post('/deleteShare', function(req, res, next) {
    // GET/users/ route
    connection.query(`DELETE FROM shares
    WHERE  
    user_id = ${req.body.user} &&
    post_id = ${req.body.post}
    `, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        return res.json({valid:true});
      }                   
    });
  });

module.exports = router;