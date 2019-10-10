const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';
import Jimp from 'jimp';
var fs = require('fs');
var nodeMailer = require('nodemailer');

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
    if(friends==='' || !friends){me=req.body.user}else{me=', '+req.body.user}
    connection.query(`
        SELECT posts.id, posts.user_post, posts.date, posts.likes, posts.comments, posts.shares, posts.text, posts.media, users.firstName, users.surname, users.correo, profiles.avatar, 'False' as sharr,
        IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
        IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
        FROM posts
        JOIN users ON posts.user_post = users.id
        JOIN profiles ON posts.user_post = profiles.user_id
        WHERE posts.user_post IN ( ${friends} ${me}) 
        ORDER BY posts.date DESC   
        LIMIT ${req.body.from}, ${req.body.to} 
    `,function(err,rows){  
      if(err) {console.log(err); return res.status(203).json({valid:false, error: 'Error'})}
      posts.normal = rows
      connection.query(` 
        SELECT 
        posts.id, shares.user_id, posts.user_post, posts.date, posts.likes, posts.comments, posts.shares, posts.text, posts.media, 
        users.firstName, users.surname, profiles.avatar, uShare.firstName as shareFirstname, uShare.surname as shareSurname, 'True' as sharr,
        IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
        IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
        FROM posts
        JOIN shares ON posts.id = shares.post_id
        JOIN users ON users.id = shares.user_id
        JOIN profiles ON profiles.user_id = posts.user_post
        JOIN users as uShare ON posts.user_post = uShare.id
        WHERE posts.user_post IN ( ${friends} ${me}) 
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

router.post('/getPostsByEmail', function(req, res, next) {
  // GET/users/ route
  connection.query(`
  SELECT *
  FROM users
  WHERE correo = '${req.body.email}'
  `,function(err,rows){
    if(err){
      return res.status(203).json({valid:false, error: 'Error'})   
    }else if(rows[0]){
      var idUser = rows[0].id
      connection.query(`
      SELECT id, date,text,media, user_post
      FROM posts
      WHERE user_post = ${idUser}
      `,function(err2,rows2){
        if(err2){
          return res.status(203).json({valid:false, error: 'Error'})   
        }else{
          return res.json({valid:true, result: rows2});
        }                   
      });
    }else{
      return res.status(203).json({valid:false, error: 'Error'})   
    }                   
  });
 
});
router.post('/getPostsByid', function(req, res, next) {
    // GET/users/ route
    connection.query(`
    SELECT posts.id, posts.user_post, posts.date, posts.comments,posts.shares,posts.likes,posts.text,posts.media, 
    IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.getUser} AND post_id = posts.id), "True","False" ) AS liked,
    IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.getUser} AND post_id = posts.id), "True","False" ) AS shared
    FROM posts
    WHERE user_post = ${req.body.user} AND posts.user_post NOT IN 
    ( SELECT user FROM blockeds WHERE user=${req.body.user} AND blocked=${req.body.getUser} )
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
    SELECT posts.id as id_post, posts.user_post, posts.date, posts.comments, posts.shares, posts.likes, posts.text, 
    posts.media, 
    ( IF(likeCount.likerino>0, likeCount.likerino,0) + 
    IF(commentsCount.commenterino>0, commentsCount.commenterino,0) + 
    IF(sharesCount.sharerino>0, sharesCount.sharerino,0) ) AS interaccion,
     users.id, users.firstName, users.surname, profiles.avatar,
    IF(EXISTS (SELECT * FROM likes WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS liked,
    IF(EXISTS (SELECT * FROM shares WHERE user_id = ${req.body.user} AND post_id = posts.id), "True","False" ) AS shared
    FROM posts
    JOIN profiles ON posts.user_post = profiles.user_id
    LEFT JOIN 
        ( SELECT posts.id, COUNT(likes.id) AS likerino
        FROM posts
        INNER JOIN likes ON posts.id = likes.post_id AND likes.timestamp >= ${req.body.dateFrom} AND likes.timestamp < ${req.body.dateTo}
        GROUP BY posts.id ) AS likeCount ON likeCount.id = posts.id
    LEFT JOIN 
        ( SELECT posts.id, COUNT(comments.id) AS commenterino
        FROM posts
        INNER JOIN comments ON posts.id = comments.post_id AND comments.date >= ${req.body.dateFrom} AND comments.date < ${req.body.dateTo}
        GROUP BY posts.id ) AS commentsCount ON commentsCount.id = posts.id
    LEFT JOIN 
        ( SELECT posts.id, COUNT(shares.id) AS sharerino
        FROM posts
        INNER JOIN shares ON posts.id = shares.post_id AND shares.timestamp >= ${req.body.dateFrom} AND shares.timestamp < ${req.body.dateTo}
        GROUP BY posts.id ) AS sharesCount ON sharesCount.id = posts.id
    LEFT JOIN users ON posts.user_post = users.id
    WHERE posts.user_post NOT IN 
    ( SELECT user FROM blockeds WHERE user=posts.user AND blocked=${req.body.user} )
    ORDER BY interaccion DESC
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

  router.post('/getOnePost', function(req, res, next) {
    connection.query(`
    SELECT id, date,text,media, user_post
    FROM posts
    WHERE id = ${req.body.id}
    `,function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        return res.json({valid:true, result: rows});
      }                   
    });  
  });
router.post('/reportPost', function(req, res, next) {
  if(reportMail(req.body.report,req.body.email, req.body.fullname, req.body.user_id) ){
    return res.json({valid:true});
  }
  return res.json({valid:false});
});

const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './public/uploads')
    },
    filename(req, file, callback) {
      var name = `${file.fieldname}_${Date.now()}_${file.originalname}`;
      
        callback(null, name) 
    },
})
const upload = multer({ storage: Storage }).single('file');

function reportMail(post, correo, fullname, id){
  let transporter = nodeMailer.createTransport({
    host: 'mail.collegevenueapp.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@collegevenueapp.com',
      pass: 'CollegeVenue10'
    }
  });
  let mailOptions = { 
    from: 'College Venue <info@collegevenueapp.com>', // sender address
    to: 'info@collegevenueapp.com', // list of receivers
    subject: "Report post", // Subject line
    text: `${id} - ${fullname} <${correo}> has reported the following post: ${post}`, // plain text body
    html: `<b>${id} - ${fullname} <${correo}></b> has reported the following post: <b>${post}</b>` 
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return false;
    return true
  });
};


router.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err)
            return res.status(500).json(err)
        } else if (err) {
            console.log(err)
            return res.status(500).json(err)
        }
        var uriParts = req.file.filename.split('.');
        var fileType = uriParts[uriParts.length - 1];
        if(fileType==='jpg' || fileType==='png' || fileType==='jpeg')
        {
          Jimp.read(path.join(__dirname,'/../../public/uploads/'+req.file.filename), (err, lenna) => {
            if (err) throw err;
            lenna
              .resize(700, Jimp.AUTO) // resize
              .quality(80) // set JPEG quality
              .write(path.join(__dirname,"/../../public/uploads/compresed/"+req.file.filename),(r)=>{
                fs.unlink(path.join(__dirname,'/../../public/uploads/'+req.file.filename), function (err) {
                  if (err) throw err;
                }); 
              }); // save 
          });
          return res.status(200).json({valid:true, result: req.file})
        }
        return res.status(200).json({valid:true, result: req.file})
    })
  
})

module.exports = router;