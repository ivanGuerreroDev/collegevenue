var mysql=require('mysql');
var connection=mysql.createConnection({
  host:'businet-web.com',
  user:'fsanmcbx_ivan',
  password:'rogue195:)',
  database:'fsanmcbx_venue'
});
module.exports = connection; 