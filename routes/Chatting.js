/**
 * Created by ESSEL on 16-Dec-14.
 */
module.exports = function(app,myio,dbconnection) {

  app.get('/Chatting', function (req, res) {
    var id = req.user.id;
    var currentUser = [];
    dbconnection.query('SELECT CONCAT(FirstName," ",LastName," ",MiddleName) As FullName from Customers where LoginStatus=? and CustomerID', [1, id], function (err, rows) {
      if (err) throw err;
      for (var i = 0; i < rows.length; i++) {
        currentUser.push(rows[i].FullName);
        myio.sockets.emit('newCustomerList', currentUser);
      }
    })
      res.render('pages/Chat');
    });
    myio.on('connection', function (socket) {
      socket.on('chat message', function (msg) {
        myio.emit('chat message', msg);
      });
    });

}

/*
  var people = {};
  myio.sockets.on("connection", function (client) {
    var currentUser = [];
    dbconnection.query('SELECT CONCAT(FirstName," ",LastName," ",MiddleName) As FullName from Customers where LoginStatus=?', [1], function (err, rows) {
      if (err) throw err;
      for (var i = 0; i < rows.length; i++) {
        currentUser = rows[i].FullName;
        console.log('a user connected: ' + currentUser);
        socket.emit('users', {loggedinusers: '<strong>' + currentUser + '</strong>'});
      }

    })*/
