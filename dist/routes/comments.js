"use strict";

var _multer = _interopRequireDefault(require("multer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const express = require('express');

const router = express.Router();

const path = require('path');

var passport = require('passport');

var connection = require('../config/db');

var bcrypt = require('bcrypt');

var notify = require("./notification");

router.post("/createComment", function (req, res) {
  var values = '',
      indexs = '';
  let i = 0;

  for (var key in req.body) {
    if (key == 'comment'
    /*|| key == 'media'*/
    ) {
        values += "'" + req.body[key] + "'";
        indexs += key;
      } else {
      values += req.body[key];
      indexs += key;
    }

    if (i != Object.keys(req.body).length - 1) {
      values += ', ';
      indexs += ', ';
    }

    i++;
  }

  ;
  connection.query(`
        INSERT INTO comments
        (${indexs})
        VALUES (${values})  
    `, function (err, rows) {
    console.log(err);
    if (err) return res.json({
      valid: false,
      error: 'Error'
    });

    if (rows) {
      var token;
      var message;
      var data;
      connection.query(`
            SELECT *
            FROM users
            WHERE users.id IN (SELECT posts.user_post
                               FROM posts
                               WHERE posts.id = ${req.body.post_id})
            `, function (err, rows) {
        token = rows[0].pushtoken;
        connection.query(`
                SELECT users.firstname, users.surname, profiles.avatar
                FROM users
                INNER JOIN profiles ON profiles.user_id = users.id
                AND users.id = ${req.body.user_id}
                `, function (err, rows) {
          message = '' + rows[0].firstname + ' ' + rows[0].surname + ' commented your post';
          data = {
            text: rows[0].firstname + ' ' + rows[0].surname + ' commented your post',
            time: req.body.timestamp,
            avatar: rows[0].avatar
          };
          notify(token, message, data);
        });
      });
      return res.json({
        valid: true
      });
    }
  });
});
router.post('/getCommentsByid', function (req, res, next) {
  // GET/users/ route
  connection.query(`
    SELECT comments.user_id, comments.post_id, comments.comment, comments.date, users.firstName, users.surname, profiles.avatar
    FROM comments 
    JOIN users ON comments.user_id = users.id
    JOIN profiles ON comments.user_id = profiles.user_id
    WHERE comments.post_id = ${req.body.post}
    ORDER BY comments.date DESC
    LIMIT ${req.body.from}, ${req.body.to} 
    `, function (err, rows) {
    if (err) {
      return res.status(203).json({
        valid: false,
        error: 'Error'
      });
    } else {
      return res.json({
        valid: true,
        result: rows
      });
    }
  });
});
router.post('/updateComment', function (req, res, next) {
  // GET/users/ route
  connection.query(`UPDATE comments 
    SET text = ${req.body.text}
    WHERE id = ${req.body.comment} && 
    user_id = ${req.body.user} && 
    user_post = ${req.body.post}`, function (err, rows) {
    if (err) {
      return res.status(203).json({
        valid: false,
        error: 'Error'
      });
    } else {
      console.log(rows);
      return res.json({
        valid: true,
        result: rows
      });
    }
  });
});
router.post('/deleteComment', function (req, res, next) {
  // GET/users/ route
  connection.query(`DELETE FROM comments 
    WHERE id = ${req.body.comment} &&
    user_id = ${req.body.user} &&
    post_id = ${req.body.post}
    `, function (err, rows) {
    if (err) {
      return res.status(203).json({
        valid: false,
        error: 'Error'
      });
    } else {
      console.log(rows);
      return res.json({
        valid: true,
        result: rows
      });
    }
  });
});
module.exports = router;