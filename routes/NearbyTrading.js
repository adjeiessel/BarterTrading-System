module.exports = function(app,dbconnection) {
//   GET home page.
  app.get('/NearByTrading',isLoggedIn, function (req, res) {
    var loginstatus='1';
    dbconnection.query('SELECT  CONCAT(FirstName," ",LastName," ",MiddleName) As FullName,ProfilePicture from Customers where LoginStatus=?',[loginstatus], function (err, rows) {
      if (err)
        console.log('Error',err);
        res.render('pages/NearByTrading',{OnlineTraders:rows});
    })
  });
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page   res.redirect('/');
    res.redirect('/logins');
  }

}



