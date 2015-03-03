module.exports = function(app, dbconnection) {
//   GET home page.
  app.get('/ViewOffersServices', isLoggedIn, function (req, res) {
    var customerid=req.user.id;
    //select productCategory and assign to option select field for seach
    dbconnection.query('SELECT CategoryName from ProductCategories ', function (err, Catrows) {
      if (err) {
        console.log("Error Selecting : %s ", err);
      }
      //select serviceCategory and assign to option select field for seach
      dbconnection.query('SELECT ServiceCatName from ServiceCategory ', function (err, SerCatRows) {
        if (err) {
          console.log("Error Selecting : %s ", err);
        }
          //select all listed productsoffers and show
          dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where C.CustomerID !=?",[customerid], function (err, rows) {
            if (err) {
              console.log("Error Selecting : %s ", err);
            }
            //select all listed serviceoffers and show
            dbconnection.query("Select * from ServiceOffers As S Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID Join Customers As C on S.CustomerID=C.CustomerID where C.CustomerID !=?",[customerid], function (err, ServiceRows) {
              if (err) {
                console.log("Error Selecting : %s ", err);
              }
              //Get total number of records return by productoffers and serviceoffers and use a loop to add all records in an array
              // and pass the array to the view for presentation
              res.render('pages/ViewOffersServices', {data: rows, ProCat: Catrows, SerCat: SerCatRows, ServiceData:ServiceRows
              });
            })
          });
        });
      });
  });
  app.get('/productsearch', function (req, res) {
    dbconnection.query('SELECT ProductName from ProductOffers where ProductName like "%' + req.query.key + '%"', function (err, rows) {
      if (err) throw err;
      var data = [];
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].ProductName);
      }
      res.end(JSON.stringify(data));
      console.log(JSON.stringify(data));
    });
  });
    //Remember to fix the find button
    //Remember to fix the ajax searcj with the customrID
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();
    // if they aren't redirect them to the home page   res.redirect('/');
    res.redirect('/logins');
  }
};