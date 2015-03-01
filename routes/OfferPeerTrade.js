module.exports = function (app, dbconnection) {
//   GET home page.
    app.get('/OfferPeerTrade', isLoggedIn, function (req, res) {
        var LogincustomerID = req.user.id;
        //get all product categories from db into the select optionBox
        dbconnection.query("Select * from productcategories", function (err, rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
            dbconnection.query("Select * from ServiceCategory", function (err, servicerows) {
                if (err) {
                    console.log("Error Selecting : %s ", err);
                }
                dbconnection.query('Select CONCAT(FirstName," ",LastName," ",MiddleName) As FullName from customers As C Join FriendsList As F on C.CustomerID=F.FriendID where F.CustomerID=? and Status=?', [LogincustomerID, '1'], function (err, Friendrows) {
                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }
                    console.log(Friendrows);
                    res.render('pages/PeerTrade', {
                        ProCategories: rows,
                        SerCategories: servicerows,
                        MyFriends: Friendrows
                    });
                });
            });
        })
    })
    app.get('/search', function (req, res) {
        dbconnection.query('SELECT FirstName,LastName,MiddleName from customers where FirstName like "%' + req.query.key + '%"', function (err, rows) {
            if (err) throw err;
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    })
    //
    app.post('/OfferPeerTrade', function (req, res) {
        var CID, SID,Email, FriendID, PartnersID;
        //Get current logged in user ID from the session
        var LogincustomerID = req.user.id;
        //Get Data
        var PostData = {
            CategoryName: req.body.CategoryName,
            ServiceCatName: req.body.ServiceCatName,
            OptionP: req.body.OptionProduct,
            OptionS: req.body.OptionService,
            FriendName: req.body.tags
        }
        //GetFriendID(LogincustomerID,PostData.FriendName);
        //Get friendID from the Peer Table and use this to get the FriendID to save transaction between two friends
        dbconnection.query('Select FriendID,EmailAddress from FriendsList  As F Join Customers As C on F.CustomerID=C.CustomerID where F.CustomerID=? and CONCAT(FirstName," ",lastName," ",MiddleName)=?', [LogincustomerID, PostData.FriendName], function (err, row) {
            if (err) {
                console.log(err);
            } else {
                for (var a in row) {
                    FriendID = row[a].FriendID;
                    Email=row[a].EmailAddress
                    console.log('FriendID', FriendID);
                }
            }
            //Get the FriendListID which is common between the two friends
            dbconnection.query('Select FriendListID from FriendsList where CustomerID=? and FriendID=?', [LogincustomerID, FriendID], function (perrs, presults) {
                if (perrs) {
                    console.log(perrs);
                } else {
                    for (var a in presults) {
                        PartnersID = presults[a].FriendListID;
                        console.log('FriendListID', PartnersID);
                    }
                }
                if (PostData.OptionP == "Product") {
                    dbconnection.query('select CategoryID from ProductCategories where CategoryName=?', [PostData.CategoryName], function (errs, results) {
                        if (errs) {
                            console.log(errs);
                        } else {
                            for (var a in results) {
                                CID = results[a].CategoryID;
                                console.log('Product CategoryID', CID);
                            }
                        }
                        var PostProductData = {
                            //prepare to submit data into the database
                            ProductName: req.body.ProductName,
                            OfferDetails: req.body.ProductDetails,
                            OfferDate: new Date(),
                            CustomerID: LogincustomerID,
                            CategoryID: CID,
                            SuggestOffers: '0',
                            PreferredOffer: req.body.PreferredProduct,
                            Condition: req.body.Condition,
                            img0: req.files.myPhoto0.name,
                            img1: req.files.myPhoto1.name,
                            img2: req.files.myPhoto2.name,
                            img3: req.files.myPhoto3.name,
                            ProductValue: req.body.ProductValue,
                            ProcessingTime: req.body.ProcessingTime,
                            ShipsTo: req.body.SelectedAreas,
                            ShippingCost: req.body.ShippingCost,
                            ValueCurrency: req.body.CurrencyName,
                            shipCurrencyName: req.body.shipCurrencyName
                        }
                        //Save trade data into the database respective tabeles
                        dbconnection.query('Insert  into ProductOffers set? ', [PostProductData], function (err, prows) {
                            if (err) {
                                console.log("Error Inserting data", err)
                            } else {
                                console.log("products saved", prows)
                            }
                            //SAVE data into the peerTrade table as well
                            var ProducttoPeerData = {
                                FirstFriendProductOfferID: prows.insertId,
                                FriendListID: PartnersID,
                                TradeDate: new Date(),
                                TradeStatus: "Pending"
                            }
                            dbconnection.query('Insert into PeerTrade set?', [ProducttoPeerData], function (errs) {
                                if (errs) {
                                    console.log("Error Inserting data", errs)
                                } else {
                                    console.log("Peer trade saved");
                                    //save activity log
                                    AddActivityLog(PostActivity = {
                                        CustomerID: req.user.id,
                                        ActivityName: 'Sent product offer to friend',
                                        ActivityDateTime: new Date()
                                    });
                                }
                            })
                        })
                    })
                }
                else if (PostData.OptionS == "Service") {
                    dbconnection.query('select ServiceCatID from ServiceCategory where ServiceCatName=?', [PostData.ServiceCatName], function (errs, results) {
                        if (errs) {
                            console.log(errs);
                        } else {
                            for (var a in results) {
                                SID = results[a].ServiceCatID;
                                console.log('ServiceID', SID);
                            }
                        }
                        var PostServiceData = {
                            ServiceName: req.body.ServiceName,
                            ServiceDescription: req.body.ServiceDescription,
                            PublishedDate: new Date(),
                            DateAvailable: req.body.AvailabilityDate,
                            Duration: req.body.Duration,
                            CustomerID: LogincustomerID,
                            ServiceCatID: SID,
                            StartDate: req.body.StartDate,
                            EndDate: req.body.EndDate,
                            PreferredService: req.body.PreferredService,
                            SuggestOffers: '0'
                        }
                        dbconnection.query('Insert  into ServiceOffers set? ', [PostServiceData], function (err, rows) {
                            if (err) {
                                console.log("Error Inserting data", err)
                            } else {
                                console.log("service data saved", rows)
                            }
                        })
                        //SAVE data into the peerTrade table as well
                        var ServicetoPeerData = {
                            ServiceOfferID: rows.insertId,
                            TradeDate: new Date(),
                            TradeStatus: '0',
                            TraderPartnersID: PartnersID
                        }
                        dbconnection.query('Insert into PeerTrade set ', [ServicetoPeerData], function (errs) {
                            if (errs) {
                                console.log("Error Inserting data", errs)
                            } else {
                                console.log("Peer trade saved");
                                //save activity log
                                AddActivityLog(PostActivity = {
                                    CustomerID: req.user.id,
                                    ActivityName: 'Trade service with a friend:',
                                    ActivityDateTime: new Date()
                                });
                            }
                        })
                    })
                }
            })
        })
        res.redirect('/');
    })
    // for checking if user is logged in before allowing user to access the page
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/logins');
    }

    function AddActivityLog(activityData) {
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }
}

