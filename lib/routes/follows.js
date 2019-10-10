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
        SELECT * FROM blockeds
        WHERE user = ${req.body.follow} AND blocked = ${req.body.user_id} 
    `,function(err3,rows3){
        if(!rows3[0]){
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
        }else{
          return res.json({
              valid: false
          })
        }
    })
    
})


router.post('/checkFollowByID', function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT * FROM follows
  WHERE 
  user_id = ${req.body.user} AND follow = ${req.body.request}
  `, function(err,rows){
    if(err){
      console.log(err)
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      if(rows.length != 0){
        return res.json({valid:true, result: rows});
      }
      return res.json({valid:false});
    }                   
  });
});
router.post('/getfollowersByID', function(req, res, next) {
    // GET/users/ route
    connection.query(`SELECT * FROM follows
    WHERE 
    user_id = ${req.body.user} 
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
    user_id = ${req.body.user} &&
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
      ( SELECT follows.follow FROM follows WHERE follows.user_id = ${req.body.user}) 
      AND follows.follow NOT IN 
        ( SELECT follows.follow FROM follows WHERE follows.user_id = ${req.body.user}) INNER JOIN profiles ON users.id = profiles.user_id
      AND follows.follow NOT IN
        (SELECT friends.friend FROM friends WHERE friends.user_id= ${req.body.user})
        ORDER BY RAND() 
        LIMIT ${req.body.from},${req.body.to}
    `, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

router.post('/getRequests', function(req, res, next) {
  connection.query(`SELECT friend_requests.request, friend_requests.user_id, users.firstName, users.surname, profiles.avatar 
  FROM friend_requests
  JOIN users ON friend_requests.request = users.id
  JOIN profiles ON friend_requests.request = profiles.user_id
  WHERE friend_requests.user_id = ${req.body.user}
  `, function(err,rows){
    if(err){
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      console.log(rows);
      return res.json({valid:true, result: rows});
    }                   
  });
});

router.post('/getRequestsById', function(req, res, next) {
  connection.query(`
  SELECT * 
  FROM friend_requests
  WHERE user_id = ${req.body.user} AND request = ${req.body.request}
  `, function(err,rows){
    if(err){
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      console.log(rows);
      return res.json({valid:true, result: rows});
    }                   
  });
});
router.post('/sendRequests', function(req, res, next) {
  connection.query(`INSERT INTO friend_requests
  (user_id, request) VALUES (${req.body.user}, ${req.body.request})
  `, function(err,rows){
    if(err){
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      console.log(rows);
      return res.json({valid:true, result: rows});
    }                   
  });
});
router.post('/deleteRequests', function(req, res, next) {
  connection.query(`DELETE FROM friend_requests 
  WHERE user_id = ${req.body.user} AND request = ${req.body.request}
  `, function(err,rows){
    if(err){
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      connection.query(`DELETE FROM follows
      WHERE 
      user_id = ${req.body.user} &&
      follow = ${req.body.follow}
      `, function(err,rows){
        if(err){
          return res.status(203).json({valid:false, error: 'Error'})   
        }else{
          console.log(rows);
          return res.json({valid:true, result: rows});
        }                   
      });
    }                   
  });
});

module.exports = router;