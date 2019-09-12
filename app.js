import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Expo from 'expo-server-sdk';
var cors = require('cors');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');
var port = process.env.PORT || 8080;
dotenv.config();
const app = express();
var http = require('http');
const server = http.createServer(app);
let expo = new Expo();

let messages = [];
for (let pushToken of somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    continue;
  }

  // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
  messages.push({
    to: pushToken,
    sound: 'default',
    body: 'This is a test notification',
    data: { withSome: 'data' },
  })
}

// The Expo push notification service accepts batches of notifications so
// that you don't need to send 1000 requests to send 1000 notifications. We
// recommend you batch your notifications to reduce the number of requests
// and to compress them (notifications with similar content will get
// compressed).
let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
(async () => {
  // Send the chunks to the Expo push notification service. There are
  // different strategies you could use. A simple one is to send one chunk at a
  // time, which nicely spreads the load out over time:
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
    } catch (error) {
      console.error(error);
    }
  }
})();


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
app.use(express.static(__dirname + "/public"));

const users = require("./routes/users");
app.use("/api", users);
const profile = require("./routes/profile");
app.use("/api/profile", profile);
const posts = require("./routes/posts");
app.use("/api/posts", posts);
const comments = require("./routes/comments");
app.use("/api/comments", comments);
const likes = require("./routes/likes");
app.use("/api/likes", likes);
const shares = require("./routes/shares");
app.use("/api/shares", shares);
const follows = require("./routes/follows");
app.use("/api/follows", follows);
const friends = require("./routes/friends");
app.use("/api/friends", friends);

// SOCKET CHAT

var socketIO = require('socket.io')
const io = socketIO(server, {
  path: '/chat',
  serveClient: false, 
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
require("./routes/chatSocket")(io);


var bcrypt = require('bcrypt');
var pass = bcrypt.hashSync('rogue', 10)
app.get('/pass',function(req, res){
  res.send(pass)
});


app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

server.listen(port, () => {
  console.log('server started and listening on port ' + port);
}); 

process.on('SIGTERM', () => { console.log("Bye bye!"); server.close() });


 
 