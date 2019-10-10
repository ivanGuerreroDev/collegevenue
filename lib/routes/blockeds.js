const express = require('express');
const router = express.Router();
var connection  = require('../config/db');

router.post('/block/', /*isLoggedIn,*/ function(req, res, next) {
    connection.query(`
        INSERT INTO blockeds (user, blocked) VALUES (${req.body.user}, ${req.body.blocked})
    `,function(err,rows){
      if(err) return res.json({})
      if(rows) {
        connection.query(`DELETE FROM friends WHERE 
        (user_id = ${req.body.user} AND friend = ${req.body.blocked})
        OR
        (user_id = ${req.body.blocked} AND friend = ${req.body.user})`);

        connection.query(`DELETE FROM follows WHERE 
        (user_id = ${req.body.user} AND follow = ${req.body.blocked})
        OR
        (user_id = ${req.body.blocked} AND follow = ${req.body.user})`);

        connection.query(`DELETE FROM friend_request WHERE 
        (user_id = ${req.body.user} AND request = ${req.body.blocked})
        OR
        (user_id = ${req.body.blocked} && request = ${req.body.user})`);

        connection.query(`DELETE FROM chats WHERE 
        (user_1 = ${req.body.user} AND user_2 = ${req.body.blocked})
        OR
        (user_1 = ${req.body.blocked} && user_2 = ${req.body.user})`);

        return res.json({valid:true});  
      }            
    }); 
});
router.post("/unblock", function(req, res){
    connection.query(`
        DELETE FROM blockeds WHERE user=${req.body.user} AND blocked=${req.body.blocked}
    `,function(err,rows){
      if(err) return res.json({})
      if(rows) return res.json({valid:true});              
    }); 
   
})
router.post('/checkBlockByID', function(req, res, next) {
  // GET/users/ route
  connection.query(`SELECT * FROM blockeds
  WHERE 
  user = ${req.body.user} AND blocked = ${req.body.blocked}
  `, function(err,rows){
    if(err){
      console.log(err)
      return res.status(203).json({valid:false, error: 'Error'})   
    }else{
      if(rows.length != 0){
        return res.json({valid:true});
      }
      return res.json({valid:false});
    }                   
  });
});



module.exports = router;