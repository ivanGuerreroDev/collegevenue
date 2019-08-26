const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');



router.get('/:id', function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT * FROM profiles WHERE user_id = ${req.params.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        console.log(rows[0])
        return res.json({valid:true, profile: rows[0]}); 
    }                   
  });
  
});

router.get('/getPostsByid', function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT * FROM posts WHERE user_post = ${req.params.id}
  ORDER BY posts.date DESC
  LIMIT ${req.body.from}, ${req.body.to}
  `,function(err,rows){
    if(err){
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      console.log(rows);
      return res.json({valid:true, result: rows});
    }                   
  });
});



module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
