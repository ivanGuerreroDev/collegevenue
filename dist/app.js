"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _expoServerSdk = _interopRequireDefault(require("expo-server-sdk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cors = require('cors');

var session = require('express-session');

var cookieParser = require('cookie-parser');

var morgan = require('morgan');

var passport = require('passport');

var flash = require('connect-flash');

var port = process.env.PORT || 8080;

_dotenv.default.config();

const app = (0, _express.default)();

var http = require('http');

const server = http.createServer(app);
app.use(cors());

require('./config/passport')(passport); // pass passport for configuration


app.use(morgan('dev')); // log every request to the console 

app.use(cookieParser()); // read cookies (needed for auth)

app.use(_bodyParser.default.urlencoded({
  extended: false
}));
app.use(_bodyParser.default.json());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(flash()); // use connect-flash for flash messages stored in session

app.use(_express.default.static(__dirname + "../public"));

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

const domains = require("./routes/domains");

app.use("/api/domains", domains);

var bcrypt = require('bcrypt');

var pass = bcrypt.hashSync('rogue', 10);
app.get('/pass', function (req, res) {
  res.send(pass);
});
app.use("*", (req, res) => {
  res.sendFile(_path.default.resolve(__dirname, "../public", "index.html"));
});
server.listen(8081); // SOCKET CHAT

var socketIO = require('socket.io');

const io = socketIO.listen(server, {
  path: '/chat',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

require("./routes/chatSocket")(io);