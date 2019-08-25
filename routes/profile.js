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
        console.log(rows[0])
        return res.json({valid:true, profile: rows[0]}); 
    }                   
  });
  
});

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

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
