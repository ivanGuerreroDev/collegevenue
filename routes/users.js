const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
var nodeMailer = require('nodemailer');

router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
})

router.post("/login", function(req, res) {
  if(!req.body.correo){
    console.log('requiere correo')
    return res.json({
      valid: false,
      message: 'Email is required',
    });
  }else if(!req.body.password){
    console.log('requiere pass')
    return res.json({
      valid: false,
      message: 'Password is required',
    });
  }
  connection.query(`SELECT * FROM users WHERE correo = ${req.body.user} AND verified > 0`,req.body.correo, function(err, rows){
    console.log(rows)
      if (err) return res.json({message: 'Error on login', valid:false});
      if (!rows.length) {
          return res.json({message: 'Email not exist or is not verified', valid:false});
      }
      if (!bcrypt.compareSync(req.body.password, rows[0].password)){
        return res.json({message: 'Password incorrect', valid:false});
      }
      return res.json({message: 'Logged', valid:true, user:rows[0]});
  });
  
});

router.post("/register", function(req, res, next) {
  var host = req.protocol + '://' + req.get('host')
  var columns = '';var values = '';var columns2 = '';var values2 = '';
  if(req.body.greek){columns2+='greeklife, ';values2+='"'+req.body.greek+'", '}
  if(req.body.sports){columns2+='sports, ';values2+='"'+req.body.sports+'", '}
  if(req.body.firstname && req.body.surname && req.body.school && req.body.password && req.body.correo){
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
    columns+='firstName, surname, password, correo, privilege'; 
    values+='"'+req.body.firstname+'", "'+req.body.surname+'", "'+req.body.password+'", "'+req.body.correo+'", "user"';
    
  }else{return res.json({error: 'Please fill all required fields!'})}
  connection.query(`INSERT INTO users (${columns}) VALUES (${values})`,function(err,rows){
    if(err){
      if(err.code == 'ER_DUP_ENTRY') return res.json({error: 'Email in use!'});
      console.log(err); return res.status(500);   
    }else{
      console.log(req.body)
      columns2+='university, ';
      values2+='"'+req.body.school+'", '
      columns2+='user_id';
      values2+=rows.insertId;
      var code = bcrypt.hashSync(req.body.correo+req.body.username, bcrypt.genSaltSync(10), null);
      connection.query(`INSERT INTO verification (email,code) values ('${req.body.correo}','${code}')`);
      welcomeMail(req.body.correo, req.body.firstname+' '+req.body.surname, code, host);
      connection.query(`INSERT INTO profiles (${columns2}) VALUES (${values2})`,function(err2,rows2){
        console.log(err2)
        if(err2){return res.json({valid:false, notice: 'Error on register'}); ;}
        else{
          return res.json({valid:true, notice: 'User created'}); 
        }
      })
    }                  
  });
});


router.get('/users', isLoggedIn, function(req, res, next) {
  connection.query('SELECT id, firstName, surname, correo, privilege FROM users',function(err,rows){
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
  connection.query(`SELECT id, firstName, surname, correo, privilege FROM users WHERE id = ${req.params.id}`,function(err,rows){
    if(err){
     console.log(err)
     res.status(500);   
    }else{
        return res.json(rows); 
    }                  
  });
  
});
router.post('/findUser/', /*isLoggedIn,*/ function(req, res, next) {
  connection.query(`
  SELECT users.id, users.firstName, users.surname, users.correo, profiles.grade, profiles.avatar, profiles.university
  FROM users 
  JOIN profiles ON users.id = profiles.user_id
  WHERE 
  (
    users.correo LIKE '%${req.body.userFind}%' OR 
    users.firstName LIKE '%${req.body.userFind}%' OR 
    users.surname LIKE '%${req.body.userFind}%'
  ) AND
  users.id != ${req.body.user}
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
  var columns = '';var values = '';
  if(req.body.firstName && req.body.surname && req.body.correo && req.body.password){
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
    columns+='firstName, surname, privilege, correo, password'; 
    values+='"'+req.body.firstName+'", "'+req.body.surname+'", "user", "'+req.body.correo+'", '+'"'+req.body.password+'"';
  }else{return res.json({error: 'Please fill all required fields!'})}
  connection.query(`INSERT INTO users (${columns}) VALUES (${values})`,function(err,rows){
    if(err){
      if(err.code == 'ER_DUP_ENTRY') return res.json({error: 'Username or Email in use!'});
      return res.status(500);   
    }else{
      return res.json({valid:true, notice: 'User created'}); 
    }                  
  });
  
});

router.post('/recovery', function(req,res) {

  connection.query(`
  SELECT *
  FROM password_request
  WHERE email = '${req.body.correo}'  AND token = '${req.body.code}'
  `,function(err,rows){
    console.log(req.body)
    if(err) {
      console.log(err);
      console.log('Error en Request 1');
      return res.json({valid:false, notice: 'Error on Request'})
    }else{
      if(rows[0]){
      console.log(rows);
        connection.query(`
        UPDATE password_request
        SET valid = 1
        WHERE email = '${req.body.correo}'
        `,function(err,rows){
          if(err){
            console.log(err);
            console.log('Error en Request 2');
            return res.json({valid:false, notice: 'Error on Request'})
          }else{
            console.log('Token Valido');
            return res.json({valid:true, notice: 'Please Insert Your new password!'})
          }
        });
      }else{
        return res.json({valid:false, notice: 'That account did not ask for a code'});
      }       
    }      
  })
  
  
})

router.post('/newPassword', function(req,res) {

  connection.query(`
  SELECT *
  FROM password_request
  WHERE email = '${req.body.correo}' AND email IN (SELECT correo
                                                FROM users
                                                WHERE correo = '${req.body.correo}')
  AND valid = 1
  `,function(err,rows){
    if(err) {
      console.log(err);
      console.log('Error en Request 1');
      return res.json({valid:false, notice: 'Your Token is invalid or this account did not ask for a code yet'})
    }else{
    if(rows){
      req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
      console.log(rows);
        connection.query(`
        UPDATE users
        SET password = '${req.body.password}'
        WHERE correo = '${req.body.correo}'
        `,function(err,rows){
          if(err){
            console.log(err);
            console.log('Error en Request 2');
            return res.json({valid:false, notice: 'Error on Request'})
          }else{
            console.log('Password Cambiada!');
            connection.query(`
              DELETE FROM password_request
              WHERE email = '${req.body.correo}'
              `,function(err,rows){
                
            })
            return res.json({valid:true, notice: 'Your new password is saved, now try to log in!'})
          }
        });
      }else{
        return res.json({valid:false, notice: 'That account does not exists'})
      }       
    }      
  })

})



router.post('/forgotPassword', function(req,res) {

  var code = makeid(8);

  connection.query(`
  SELECT *
  FROM password_request
  WHERE email = '${req.body.correo}' AND email IN (SELECT correo
                                                FROM users
                                                WHERE correo = '${req.body.correo}')
  `,function(err,rows){
    if(err) {
      console.log(err);
      console.log('Error en Request 1');
      return res.json({valid:false, notice: 'Error on Request'})
    }else{
    if(rows.length > 0){
      console.log(rows);
      console.log('Ese Email ya tiene un Codigo');
      return res.json({valid:true, notice: 'That account already requested a code'})
      }else{
        sendCode(req.body.correo,code);
        connection.query(`
        INSERT INTO password_request (email,token,valid)
        VALUES ('${req.body.correo}','${code}',0)
        `,function(err,rows){
          if(err){
            console.log(err);
            console.log('Error en Request 2');
            return res.json({valid:false, notice: 'Error on Request'})
          }else{
            console.log('codigo enviado al email');
            return res.json({valid:true, notice: 'The code has been sent to your email!'})
          }
        });
      }       
    }      
  })

})

router.post('/confirmation/:clave', function(req,res){
 
  connection.query(`
  SELECT *
  FROM verification
  WHERE code = '${req.params.clave}' 
  `,function(err,rows){
    if(err){
     return res.status(500);
    }else{
      if(rows){
        connection.query(`
        DELETE FROM verification WHERE code = '${req.params.clave}'
        `)
        return res.json({valid:true, notice: 'You are now registered!'})
      }else{
        return res.status(500);
      }
    }
          
  })
  

})

router.post('/changePassword', function(req,res) {
  console.log(req.body)
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null);
  connection.query(`
  SELECT *
  FROM users
  WHERE id = ${req.body.id}
  `,function(err,rows){
    console.log(err)
    if(err) {
      return res.json({valid:false, notice: 'Error on Request'})
    }else{
    if(rows.length > 0){
      if(bcrypt.compareSync(req.body.oldPassword, rows[0].password)){
        connection.query(`
        UPDATE users
        SET password = '${req.body.password}'
        WHERE id = ${req.body.id}
        `,function(err,rows){
          if(err){
            console.log(err);
            console.log('Error en Request 2');
            return res.json({valid:false, notice: 'Error on Request'})
          }else{
            console.log('Password Cambiada');
            return res.json({valid:true, notice: 'Your password has been changed!'})
          }
        });
      }else{
        return res.json({valid:false, notice: 'Invalid Password'})
      }
    }else{
      console.log('Invalid Password');
      return res.json({valid:false, notice: 'Invalid Password'})
    }       
  }      
})

})

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

function makeid(length) {
  console.log('ejecutado makeid')
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function sendCode(email, code){
  console.log('ejecutado sendCode')
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'noreplybusient@gmail.com',
      pass: 'BuSiNeT1'
    }
  });
  let mailOptions = {
    from: '"Businet" <noreplybusient@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Verification Code from Businet", // Subject line
    text: "Verification Code", // plain text body
    html: '<b>The Verification Code is: '+code+'</b>' // html body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
};

function welcomeMail(email, username, code, host){
  console.log('enviando email')
  let transporter = nodeMailer.createTransport({
    host: 'mail.collegevenueapp.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@collegevenueapp.com',
      pass: 'CollegeVenue10'
    }
  });
  let mailOptions = { 
    from: '"College Venue" <noreply@collegevenueapp.com>', // sender address
    to: email, // list of receivers
    subject: "Welcome Mail", // Subject line
    text: "Welcome Mail", // plain text body
    html: '<b>Greetings '+username+', Please confirm your account here: '+host+'/confirmation/'+code+'</b>' 
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
};