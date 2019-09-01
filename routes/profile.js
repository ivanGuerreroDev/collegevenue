const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

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
     res.status(500);   
    }else{
        return res.json({valid:true, profile: rows[0]}); 
    }                   
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
        console.log(rows)
        return res.json({valid:true, profile: rows[0]}); 
    }                   
  });
});
router.post('/updateProfileById', function(req, res, next) {
  var usersQuery = ''
  if(req.body.firstName){usersQuery+='firstName = "'+req.body.firstName+'"'}
  if(req.body.surname){
    if(req.body.firstName){usersQuery+=', '}
    usersQuery+='surname = "'+req.body.surname+'"'
  }
  var profilesQuery = '';
  var i=1
  for(var key in req.body){
    if(key != 'firstName'&&key != 'surname'&&key != 'user') { 
      profilesQuery += key +" = '"+req.body[key]+"'";
      if(i!=Object.keys(req.body).length-1) profilesQuery += ', ';
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
      if(err){res.status(500);}         console.log(rows)        
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
      if(err){res.status(500);}   console.log(rows)               
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



module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
