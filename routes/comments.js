const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

router.post("/createComment", function(req, res){

    var values = '', indexs = '';
    let i = 0;
    for(var key in req.body){
        if(key == 'text' /*|| key == 'media'*/){values += "'"+req.body[key]+"'"; indexs+= key;}
        else{values += req.body[key]; indexs+= key;}
        if(i != Object.keys(req.body).length-1){values += ', '; indexs+= ', ';}
        i++
    };
    
    connection.query(`
        INSERT INTO comments
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

router.post('/getCommentsByid', function(req, res, next) {
    // GET/users/ route
    connection.query(`SELECT * FROM comments WHERE post_id = ${req.body.post}
    ORDER BY comments.date DESC
    `,function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

router.post('/updateComment', function(req, res, next) {
    // GET/users/ route
    connection.query(`UPDATE comments 
    SET text = ${req.body.text}
    WHERE id = ${req.body.comment} && 
    user_id = ${req.body.user} && 
    user_post = ${req.body.post}`, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

  router.post('/deleteComment', function(req, res, next) {
    // GET/users/ route
    connection.query(`DELETE FROM comments 
    WHERE id = ${req.body.comment} &&
    user_id = ${req.body.user} &&
    post_id = ${req.body.post}
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