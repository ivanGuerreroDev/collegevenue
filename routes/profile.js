const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';
import { isString } from 'util';

const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './public/uploads')
    },
    filename(req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    },
})
const upload = multer({ storage: Storage }).single('file');


router.get('/:id', function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT avatar, university, grade, follows, bio FROM profiles WHERE user_id = ${req.params.id}`,function(err,rows){
    if(err){
     console.log(err)
     return res.status(500);   
    }else{
        return res.json({valid:true, profile: rows[0]}); 
    }                   
  });
});

router.post('/changeAvatar/:id', function(req, res, next) {
  connection.query(`
    UPDATE profiles
    SET
    avatar = '${req.body.avatar}'
    WHERE user_id = ${req.params.id}
  `,function(err,rows){
    if(err){console.log(err); return res.status(500);}         
    else{return res.json({valid:true})}      
  });
});
router.post('/changeBg/:id', function(req, res, next) {
  connection.query(`
    UPDATE profiles
    SET
    bg = '${req.body.bg}'
    WHERE user_id = ${req.params.id}
  `,function(err,rows){
    if(err){console.log(err); return res.status(500);}         
    else{return res.json({valid:true})}      
  });
});

router.post('/getProfileById', function(req, res, next) {
  connection.query(`
    SELECT users.firstName, users.surname, users.correo, users.id, profiles.avatar, 
    profiles.university, profiles.grade, profiles.follows, profiles.bio, profiles.facebook, 
    profiles.instagram, profiles.twitter, profiles.snapchat, profiles.greeklife, profiles.sports, 
    profiles.relationship, profiles.birthdate
    FROM users 
    JOIN profiles ON profiles.user_id = users.id
    WHERE users.id = ${req.body.user}
  `,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json({valid:true, profile: rows[0]}); 
    }                   
  });
});

router.post('/getLikesById', function(req,res,next){
  connection.query(`
      SELECT posts.id, posts.user_post, posts.date, posts.comments, posts.shares, posts.likes, 
      posts.text, posts.media, profiles.avatar, users.firstName, users.surname, likes.timestamp
      FROM posts
      INNER JOIN likes ON posts.id = likes.post_id AND likes.user_id = ${req.body.user}
      INNER JOIN users ON posts.user_post = users.id
      INNER JOIN profiles ON users.id = profiles.user_id
      ORDER BY likes.timestamp DESC
      LIMIT ${req.body.from},${req.body.to}
    `,function(err,rows){
      if(err)
      {
        return res.status(500);
      }else{
        return res.json({valid:true, posts: rows}); 
      }        
    });
});

router.post('/updateProfileById', function(req, res, next) {
  var usersQuery = ''
  if(req.body.correo){usersQuery+='correo = "'+req.body.correo+'", '}
  if(req.body.firstName){usersQuery+='firstName = "'+req.body.firstName+'"'}
  if(req.body.surname){
    if(req.body.firstName){usersQuery+=', '}
    usersQuery+='surname = "'+req.body.surname+'"'
  }
  var profilesQuery = '';
  var i=1
  for(var key in req.body){
    if(key != 'firstName' && key != 'surname' && key != 'correo' && key != 'user') { 
      if(key==='birthdate'){
        profilesQuery += key +" = "+req.body[key];
      }else{
        profilesQuery += key +" = '"+mysql_real_escape_string(req.body[key])+"'";
      }
      if(i!=Object.keys(req.body).length) profilesQuery += ', ';
    }
    i++
  }
  if(req.body.firstName || req.body.surname){
    connection.query(`
      UPDATE users
      SET
      ${usersQuery}
      WHERE id = ${req.body.user}
    `,function(err,rows){
      if(err){return res.status(500);}        
    });
  }
  console.log(profilesQuery)
  if(req.body.university ||req.body.grade ||req.body.bio ||req.body.facebook ||req.body.twitter ||req.body.instagram ||req.body.snapchat){
    connection.query(`
      UPDATE profiles
      SET
      ${profilesQuery}
      WHERE user_id = ${req.body.user}
    `,function(err,rows){
      if(err){console.log(err); return res.status(500);}             
    });
  }
  return res.json({valid:true});
});

router.post('/upload', (req, res) => {
  upload(req, res, function (err) {
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

router.post('/uploadBg', (req, res) => {
  upload(req, res, function (err) {
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

router.post('/:id', function(req, res, next) {
  var values = '';
  let i = 0;
  for(var key in req.body){
      values += key+" = '"+req.body[key]+"'";
      if(i != Object.keys(req.body).length-1){values += ', ';}
      i++
  };
  connection.query(`
    UPDATE profiles
    SET ${values}
    WHERE user_id = ${req.params.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json({valid:true}); 
    }                   
  });
});

function mysql_real_escape_string (str) {
  if(typeof str === 'string' || str instanceof String){
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
  }else{
    return str
  }
}

module.exports = router; 

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
