const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

router.post("/uploadPost", function(req, res){
    var values = '', indexs = '';
    let i = 0;
    for(var key in req.body){
        if(key == 'text' || key == 'media'){values += "'"+req.body[key]+"'"; indexs+= key;}
        else{values += req.body[key]; indexs+= key;}
        if(i != Object.keys(req.body).length-1){values += ', '; indexs+= ', ';}
        i++
    };
    connection.query(`
        INSERT INTO posts
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

router.post("/getPosts", function(req, res) {
  var friends = ''; var me;
  var posts = {
    normal: [],
    shares: []
  }
  console.log(req.body)
  connection.query(`
      SELECT follow
      FROM follows
      WHERE user_id = ${req.body.user}
  `,function(err,rows){
    if(err) {console.log(err); return res.status(203).json({valid:false, error: 'Error'})}
    rows.forEach((i, idx, array) => {
        if(idx == array.length - 1){friends += i['follow']}
        else{friends += i['follow']+', '}
    });
    if(friends===''){me=req.body.user}else{me=', '+req.body.user}
    connection.query(`
        SELECT posts.id, posts.user_post, posts.date, posts.likes, posts.comments, posts.shares, posts.text, posts.media, users.firstName, users.surname, users.correo, profiles.avatar,
        IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
        IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
        FROM posts
        JOIN users ON posts.user_post = users.id
        JOIN profiles ON posts.user_post = profiles.user_id
        WHERE posts.user_post IN (${friends} ${me}) 
        ORDER BY posts.date DESC
        LIMIT ${req.body.from}, ${req.body.to}
    `,function(err,rows){
      if(err) {console.log(err); return res.status(203).json({valid:false, error: 'Error'})}
      posts.normal = rows
      connection.query(`
        SELECT 
        posts.id, shares.user_id, posts.user_post, posts.date, posts.likes, posts.comments, posts.shares, posts.text, posts.media, 
        users.firstName, users.surname, profiles.avatar, uShare.firstName as shareFirstname, uShare.surname as shareSurname,
        IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
        IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
        FROM posts
        JOIN shares ON posts.id = shares.post_id
        JOIN users ON users.id = shares.user_id
        JOIN profiles ON profiles.user_id = posts.user_post
        JOIN users as uShare ON posts.user_post = uShare.id
        WHERE posts.user_post IN (${friends} ${me}) 
        ORDER BY posts.date DESC
        LIMIT ${req.body.from}, ${req.body.to}
      `,function(err,rows){
        if(err) {console.log(err);return res.status(203).json({valid:false, error: 'Error'})}
        posts.shares = rows
        return res.json({valid:true, result: posts})
      })
    })
  });
})

router.post('/getPostsByid', function(req, res, next) {
    // GET/users/ route
    connection.query(`
    SELECT posts.id, posts.user_post, posts.date, posts.comments,posts.shares,posts.likes,posts.text,posts.media, 
    IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
    IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
    FROM posts
    WHERE user_post = ${req.body.user}
    ORDER BY date DESC
    LIMIT ${req.body.from}, ${req.body.to}
    `,function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        return res.json({valid:true, result: rows});
      }                   
    });
  });

  router.post('/getMediaPostsByid', function(req, res, next) {
    // GET/users/ route
    connection.query(`
    SELECT posts.id, posts.user_post, posts.date, posts.comments,posts.shares,posts.likes,posts.text,posts.media, 
    IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
    IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
    FROM posts
    WHERE user_post = ${req.body.user} AND media <> ''
    ORDER BY date DESC
    LIMIT ${req.body.from}, ${req.body.to}
    `,function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        return res.json({valid:true, result: rows});
      }                   
    });
  });

router.post('/getTrendingPosts', function(req, res, next) {
    // GET/users/ route
    connection.query(`
    SELECT posts.id, posts.date, posts.comments, posts.shares, posts.likes, posts.text, posts.media, users.id, users.firstName, users.surname 
    FROM posts 
    INNER JOIN users ON posts.user_post = users.id 
    WHERE posts.date <= ${req.body.dateTo} AND posts.date > ${req.body.dateFrom}
    AND posts.likes > 0 AND posts.shares > 0 AND posts.comments > 0
    ORDER BY posts.shares DESC, posts.likes DESC, posts.comments DESC
    LIMIT ${req.body.from}, ${req.body.to}
    `,function(err,rows){
      if(err){
        console.log(err)
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        return res.json({valid:true, result: rows});
      }                   
    });
});

router.post('/updatePost', function(req, res, next) {
    // GET/users/ route
    connection.query(`UPDATE posts 
    SET text = ${req.body.text}
    WHERE id = ${req.body.post} && user_post = ${req.body.user}`, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

router.post('/deletePost', function(req, res, next) {
    // GET/users/ route
    connection.query(`DELETE FROM posts WHERE id = ${req.body.post}`, function(err,rows){
      if(err){ return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        return res.json({valid:true, result: rows});
      }                   
    });
  });

const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './public/uploads')
    },
    filename(req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    },
})
const upload = multer({ storage: Storage }).single('file');

router.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        console.log(req.file)
        if (err instanceof multer.MulterError) {
            console.log(err)
            return res.status(500).json(err)
        } else if (err) {
            console.log(err)
            return res.status(500).json(err)
        }
        return res.status(200).json({valid:true, result: req.file})
    })
  
})

module.exports = router;