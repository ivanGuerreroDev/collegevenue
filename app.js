import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
var cors = require('cors');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');
dotenv.config();
const app = express();
var http = require('http');
const server = http.createServer(app);
var socketIO = require('socket.io')
const io = socketIO(server, {
  path: '/chat',
  serveClient: false, 
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
app.use(cors())
require('./config/passport')(passport); // pass passport for configuration
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
} )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
var connection  = require('./config/db');
app.use(express.static(__dirname + "/public"));


var onlineUsers = [] 
function findUser(user){
  var result;
  for( var i=0; i < onlineUsers.length; i++ ) {
    if( onlineUsers[i]['id'] === user ) {result = onlineUsers[i]['socketID']}
  }
  return result
}
function removeUser(id){
  for( var i = 0; i < onlineUsers.length; i++){ 
    
    if ( onlineUsers[i]['id'] === id) {
      onlineUsers.splice(i, 1); 
    }
 }
}
io.on('connection', function(socket){
  onlineUsers.push({id: socket.handshake.query.id, socketID: socket.id})
  socket.on('update messages', function (data) {
    console.log(data.timestamp)
    connection.query(`
    SELECT messages.id, messages.to_user, messages.from_user, messages.message, messages.timestamp, users.firstName, users.surname, users.correo, profiles.avatar
    FROM ((messages
    INNER JOIN users ON messages.from_user = users.id)
    INNER JOIN profiles ON messages.from_user = profiles.user_id)
    WHERE 
    (messages.to_user = ${data.id} OR messages.from_user = ${data.id}) AND messages.timestamp > ${data.timestamp}
    `,function(err,rows){
      if(rows){
        var socketID = findUser(data.correo);
        io.to(socketID).emit('MESSAGES_SEND', rows[0])
      }
    });
  })

  socket.on('new message', function(data){
    console.log('message recived '+ data.message)
    connection.query(`
    INSERT INTO messages 
    (to_user, from_user, message, timestamp)
    VALUES
    ( ${data.id}, ${data.from_user}, '${data.message}', ${data.timestamp})
    `,function(err,rows2){ 
      console.log(err)
      console.log(rows2)
      socket.to(findUser(data.correo)).emit('message recived', data)
      socket.emit('message recived', data)
    });
  })

  socket.on('disconnect', function(socket){
    removeUser(socket.username);
  });
});

const users = require("./routes/users");
app.use("/api", users);
const profile = require("./routes/profile");
app.use("/api/profile", profile);
const feed = require("./routes/feed");
app.use("/api/feed", feed);

var bcrypt = require('bcrypt');
var pass = bcrypt.hashSync('rogue', 10)
app.get('/pass',function(req, res){
  res.send(pass)
}) 


app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

server.listen(3000, () => {
  console.log('server started and listening on port ' + 3000);
}); 



