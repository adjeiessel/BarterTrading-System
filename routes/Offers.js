module.exports = function (app, dbconnection) {
//   GET home page.
    //Get all offers posted by current loggin customer only
    app.get('/Offers', isLoggedIn, function (req, res) {
//based on his/her ID customerID
        var id = req.user.id;
        dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where P.CustomerID=?", [id], function (err, rows) {
            if (err) {
                console.log(err);
            }
            dbconnection.query("Select * from ServiceOffers As S Join Customers As C on S.CustomerID=C.CustomerID Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID where C.CustomerID=?", [id], function (err, srows) {
                if (err) {
                    console.log(err);
                }
                res.render('pages/Offers', {results: rows, loginuser: req.user.id, serviceresults: srows});
            });
        });
    })
    app.get('/Offers/:id', isLoggedIn, function (req, res) {
        //based on his/her ID
        //shows the pingoffers form instead, that's where the other customer can respond
        var PingID = req.params.id;
        var ProductID;
        dbconnection.query("Select InterestedCustomerID from ProductOfferPings where PingID=?", [PingID], function (err, pingrows) {
            if (err) {
                console.log(err);
            }
            if (pingrows) {
                for (var i in pingrows) {
                    ProductID = pingrows[i].InterestedCustomerID
                }
            }

            dbconnection.query("Select * from ProductOffers As P Join Customers As C on P.CustomerID=C.CustomerID Join ProductCategories As PC on PC.CategoryID=P.CategoryID where P.CustomerID=?", [ProductID], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                dbconnection.query("Select * from ServiceOffers As S Join Customers As C on S.CustomerID=C.CustomerID Join ServiceCategory As SC on SC.ServiceCatID=S.ServiceCatID where C.CustomerID=?", [ProductID], function (err, srows) {
                    if (err) {
                        console.log(err);
                    }
                    res.render('pages/PingOffers', {
                        results: rows,
                        loginuser: req.user.id,
                        serviceresults: srows,
                        GetPingID:PingID,
                        Message: 'Customer also has these products to offer.Ping back if you are interested in any'
                    });
                });
            });
        })
    })
// route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
}
