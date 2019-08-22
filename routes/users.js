const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
})

router.post("/login", passport.authenticate("local"), function(req, res) {
  if(!req.body.correo){
    return res.status(400).send({
      valid: false,
      message: 'Email is required',
    });
  }else if(!req.body.password){
    return res.status(400).send({
      valid: false,
      message: 'Password is required',
    });
  }
  res.json({message: 'Logged', valid:true, user:req.user});
});

router.post("/register", function(req, res, next) {
  if(!req.body.firstname || !req.body.surname || !req.body.correo || !req.body.password || !req.body.gender) {
    console.log(req.body);
    res.json({valid: false, error: 'Please fill all fields!'})
  }
  var columns = '', values = '';
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
  for(var key in req.body){
    if(key != 'id') {
      columns += key; values += "'"+req.body[key]+"'";
      columns += ', ';values += ', ';
    } 
  }
  columns+="privilege";
  values+="'user'";
  connection.query(`INSERT INTO users (${columns}) VALUES (${values})`,function(err,rows){
    if(err){
      if(err.code == 'ER_DUP_ENTRY') {res.json({valid: false, error: 'Username or Email in use!'}); }
      else{res.status(500);} 
    }else{
      return res.json({valid:true, message: 'Resgistered'}); 
    }                  
  });
});


router.get('/users', isLoggedIn, function(req, res, next) {
  // GET/users/ route
  connection.query('SELECT id, firstName, surname, correo, gender, privilege FROM users',function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json(rows); 
    }                  
  });
  
});
router.get('/user/:id', isLoggedIn, function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT id, firstName, surname, correo, gender, privilege FROM users WHERE id = ${req.params.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json(rows); 
    }                  
  });
  
});
router.get('/findUser/:data', /*isLoggedIn,*/ function(req, res, next) {
  connection.query(`
  SELECT users.id, users.firstName, users.surname, users.correo, profiles.grade, profiles.avatar, profiles.university
  FROM users 
  INNER JOIN profiles ON users.id = profiles.user_id
  WHERE users.correo LIKE '%${req.params.data}%' OR users.firstName LIKE '%${req.params.data}%' OR users.surname LIKE '%${req.params.data}%'
  `,function(err,rows){
    if(err) return res.json({})
    if(rows) return res.json(rows);              
  });
   
});

router.post('/user', isLoggedIn, function(req, res, next) {
  var dataUpdate = '';
  var i=0;
  for(var key in req.body){
    if(key != 'id') {
      dataUpdate += key +" = '"+req.body[key]+"'";
      if(i!=Object.keys(req.body).length-1) dataUpdate += ', ';
    }
    i++
  }

  connection.query(`UPDATE users SET ${dataUpdate} WHERE id = ${req.body.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json({notice: 'Updated'}); 
    }                  
  });
  
});

router.post('/user/create', isLoggedIn, function(req, res, next) {
  var columns = '';
  var values = '';
  var i=0;
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
  for(var key in req.body){
    if(key != 'id') {
      columns += key 
      values += "'"+req.body[key]+"'";
      if(i!=Object.keys(req.body).length-1) {columns += ', ';values += ', ';}
    }
    i++
  }
  connection.query(`INSERT INTO users (${columns}) VALUES (${values})`,function(err,rows){
    if(err){
      if(err.code == 'ER_DUP_ENTRY') res.json({error: 'Username or Email in use!'}); 
      console.log(err)
      res.status(500);   
    }else{
        return res.json({notice: 'User created'}); 
    }                  
  });
  
});
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
