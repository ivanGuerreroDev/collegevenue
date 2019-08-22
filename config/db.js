var mysql=require('mysql');
var connection=mysql.createPool({
  host:'businet-web.com',
  user:'fsanmcbx_ivan',
  password:'rogue195:)',
  database:'fsanmcbx_venue',
  connectionLimit : 100,
  waitForConnections : true,
  queueLimit :0,
  wait_timeout : 28800,
  connect_timeout :10
});
module.exports = connection; 