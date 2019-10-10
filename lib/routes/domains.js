const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
var moment = require('moment');
import multer from 'multer';
var notify = require("./notification");
 
router.post("/", function(req, res){
    connection.query(`SELECT * FROM domains`, function(err,rows){
        if(err) return res.status(203).json({valid:false, message: 'Error'}) 
        else return res.json({valid:true, message: 'Error', data: rows}) 
    })  
})

router.post("/add", function(req, res){
    connection.query(`SELECT * FROM domains WHERE domain = '${req.body.domain}'`, function(err,rows){
        if(err) {console.log(err); return res.json({valid:false, message: 'Error'}) }
        else if(rows[0]) return res.json({valid:false, message: 'Domain already added!'}) 
        else{
            connection.query(`INSERT INTO domains (domain) VALUES ('${req.body.domain}')`, function(err2,rows2){
                if(rows2) return res.json({valid:true, message: 'Added'})  
            })
        }
    })      
})   
router.post('/delete', function(req, res, next) {
    // GET/users/ route
    connection.query(`DELETE FROM domains
    WHERE 
    id = ${req.body.id}
    `, function(err,rows){
      if(err){
        return res.status(203).json({valid:false, error: 'Error'})   
      }else{
        console.log(rows);
        return res.json({valid:true, result: rows});
      }                    
    }); 
  });   
      
    
       
module.exports = router;