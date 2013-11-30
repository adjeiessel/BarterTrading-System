adjeiessel
==========

Testing mysql
var mysqlConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'carousel',
  debug : true,
});

mysqlConnection.connect(function(err) {
  if ( !err ) {
    console.log("Connected to MySQL");
  } else if ( err ) {
    console.log(err);
  }
});
