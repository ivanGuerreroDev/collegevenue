const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

router.post('/findFriend/', /*isLoggedIn,*/ function(req, res, next) {
    connection.query(`
        SELECT users.id, users.firstName, users.surname, users.correo, profiles.grade, profiles.avatar, 
        profiles.university
        FROM users 
        JOIN profiles ON users.id = profiles.user_id
        WHERE 
        (
        users.correo LIKE '%${req.body.userFind}%' OR 
        users.firstName LIKE '%${req.body.userFind}%' OR 
        users.surname LIKE '%${req.body.userFind}%'
        ) AND
        users.id != ${req.body.user}
        AND users.id IN (SELECT friend FROM friends WHERE user_id = ${req.body.user})
    `,function(err,rows){
      if(err) return res.json({})
      if(rows) return res.json(rows);              
    }); 
});
router.post("/sendFriendRequest", function(req, res){
    connection.query(`
        SELECT * FROM friend_requests
        WHERE user_id = ${req.body.user} AND request = ${req.body.friend} 
    `,function(err,rows){
        if(rows[0]){
            connection.query(`
            INSERT INTO friend_requests
            (user_id,request)
            VALUES (${req.body.user},${req.body.friend})  
            `,function(err2,rows2){
                if(err){ 
                    console.log(err2)
                    return res.json({valid:false, error:'Error'}) 
                }else{
                    return res.json({valid:true, error:false})
                }
            })
        }else{
            return res.json({valid:false, error:'Error'}) 
        }
    })
   
})

router.post("/deleteFriendRequest", function(req, res){
    connection.query(`
        DELETE FROM friend_requests
        WHERE user_id = ${req.body.user} AND request = ${req.body.friend} 
    `,function(err,rows){
        if(err){ 
            console.log(err)
            return res.json({valid:false, error:'Error'}) 
        }else{
            return res.json({valid:true, error:false})
        }
    })
})

router.post("/getFriendRequestById", function(req, res){

    connection.query(`
        SELECT users.id, users.firstName, users.surname, users.correo, profiles.avatar
        FROM friend_requests
        INNER JOIN users ON users.id = friend_requests.user_id
        JOIN profiles ON profiles.user_id = ${req.body.user}  
        WHERE friend_requests.request = ${req.body.user}  
    `,function(err,rows){
        if(err){ 
            console.log(err)
            return res.json({valid:false, error:'Error'}) 
        }else{
            return res.json({valid:true, requests: rows})
        }
    })
})

router.post("/addFriend", function(req, res){
    connection.query(`
        INSERT INTO friends
        (user_id,friend)
        VALUES
            (${req.body.user},${req.body.friend}), 
            (${req.body.friend},${req.body.user})
    `,function(err,rows){
        if(err){ 
            console.log(err)
            return res.json({valid:false, error:'Error'}) 
        }else{
                connection.query(`
                INSERT INTO follows
                (user_id,follow)
                VALUES
                    (${req.body.user},${req.body.friend}), 
                    (${req.body.friend},${req.body.user})
                    
            `,function(err,rows){
                if(err){ 
                    console.log(err)
                    return res.json({valid:false, error:'Error'}) 
                }else{
                    
                    return res.json({valid:true, result:rows})
                }
            })
        }
    })
})

router.post('/deleteFriend', function(req, res, next) {
    // GET/users/ route
    connection.query(`DELETE FROM friends
    WHERE 
    (user_id = ${req.body.user} AND friend = ${req.body.friend}) OR
    (user_id = ${req.body.friend} AND friend =  ${req.body.user})
    `, function(err,rows){
      if(err){
        console.log(err)
        return res.status(203).json({valid:false, error: 'Error'});   
      }else{
        //console.log(rows);
        return res.json({valid:true, result: rows});
      }                   
    });
  });

router.post("/getFriendsById", function(req, res){
    connection.query(`
        SELECT users.id, friends.user_id, users.firstName, users.surname, users.correo, profiles.avatar
        FROM friends
        JOIN profiles ON friends.friend = profiles.user_id
        JOIN users ON users.id = friends.friend
        WHERE friends.user_id = ${req.body.user}  
    `,function(err,rows){
        console.log(err)
        if(err){ 
            return res.status(203).json({valid:false, error: 'Error'}); 
        }else{
            return res.json({valid:true, result:rows});
        }
    })
})

router.post("/checkFriendById", function(req, res){

    connection.query(`
        SELECT friend
        FROM friends
        WHERE user_id = ${req.body.user} AND friend = ${req.body.friend}
    `,function(err,rows){
        if(err){ 
            console.log(err)
            return res.json({valid:false, error:'Error'}) 
        }else if(rows[0]){
            return res.json({valid:true, error:false})
        }else{
            connection.query(`
                SELECT user_id, request
                FROM friend_requests
                WHERE user_id = ${req.body.user} AND request = ${req.body.friend}
            `,function(err2,rows2){
                if(err2){ 
                    console.log(err)
                    return res.json({valid:false, error:'Error'}) 
                }else if(rows2[0]){
                    return res.json({valid:true, error:false})
                }
            })
        }
    })
})



module.exports = router;