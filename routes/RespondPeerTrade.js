module.exports = function (app, dbconnection, transporter, AddNotification, SaveActivity) {
//   GET home page.

    //Get the details of the product the friend posted to peer
    app.get('/RespondPeerTrade/:id', isLoggedIn, function (req, res) {
        var LogincustomerID = req.user.id;
        var pingID = req.params.id;
        var tradestatus = "Pending";

        dbconnection.query("Select * from productoffers As P Join PeerTrade As PT on P.ProductOfferID=PT.FirstFriendProductOfferID Join ProductCategories As C on C.CategoryID=P.CategoryID where PeerTradeID=? and TradeStatus=?", [pingID, tradestatus], function (err, rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
            console.log(rows);
            res.render('pages/AcceptPeerOffers', {PeerOffer: rows});
        });
    });
    //Respond to Offer(Accept or Decline)If Accepted the tradedetails should be updated and the
    // form should be redirected to  RESPOND PEER TRADE where he can also make an offer to friend
    // If Declined, just send an email informing friend of unsuccessful trade but rather the item will show in general
    //offers

    app.post('/RespondPeerTrade/:id', function (req, res) {
        //
        var PeerTradeID = req.params.id;
        var urllink
        if (req.body.ChkDecline) {
            var PeerTrade = {
                TradeStatus: 'Declined'
            }
            var ProductStatus = {
                ProductStatus: "Available"
            }
            dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                if (err) throw err
                console.log('Peer Trade Rejected');
            })
            dbconnection.query('Update ProductOffers  As P Join PeerTrade As PT On PT.FirstFriendProductOfferID=P.ProductOfferID set? where PT.PeerTradeID=? ', [ProductStatus, PeerTradeID], function (err) {
                if (err) throw err
                console.log('product status updated');
            })
            res.redirect('/');
        } else {
            var PeerTrade = {
                TradeStatus: 'Accepted'
            }
            dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                if (err) throw err
                console.log('Peer Trade Accepted');
            })
            dbconnection.query('Select * from Customer As  C Join FriendsList As F on C.CustomerID=F.FriendID Join PeerTrade As PT on FriendListID=F.FriendListID where PeerTradeID=? ', [PeerTradeID], function (err, rows) {
                if (err) throw err
                console.log('Peer Trade Accepted');

                //redirect to RespondPeerTrade to allow customer to also make an offer and notify customer via email and notification
                res.render('pages/RespondPeerTrade', {CustomerDetails: rows});
            })
        }
    })
    /* app.get('/searchpeer', function (req, res) {
     dbconnection.query('Select FirstName,LastName,MiddleName from FriendsList  As F Join Customers As C on F.FriendID=C.CustomerID where F.CustomerID="'+ req.user.id +'" and FirstName like "%' + req.query.key + '%"', function (err, rows) {
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
     FriendName: req.body.typeahead
         }
     //GetFriendID(LogincustomerID,PostData.FriendName);
     //Get friendID from the Peer Table and use this to get the FriendID to save transaction between two friends
     dbconnection.query('Select FriendID,EmailAddress from FriendsList  As F Join Customers As C on F.FriendID=C.CustomerID where F.CustomerID=? and CONCAT(FirstName," ",lastName," ",MiddleName)=?', [LogincustomerID, PostData.FriendName], function (err, row) {
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
     dbconnection.query('Insert into PeerTrade set?', [ProducttoPeerData], function (errs,peerrows) {
     if (errs) {
     console.log("Error Inserting data", errs)
     } else {
     console.log("Peer trade saved");
     var PeerTradeID=peerrows.insertId
     var urllink = "http://" + req.get('host') + "/RespondPeerTrade/" +PeerTradeID
     //send mail
     var mailOptions = {
     to: Email, // list of receivers
     subject: 'Peer Trade', // Subject line
     html: 'Hello ' + PostData.FriendName + ',<br><br> ' + req.user.FN + ' wants to trade ' + PostProductData.ProductName + ' with you.<br>Please ' +
     'open the link below to see if you are interested to trade any item/product with him for that offer.<br><br><a href="' + urllink + '">Click to check offer from friend</a><br><br>Thank you!<br>Barter Trading Team </br>'
     };
     sendemail(mailOptions);
     //save activity log
     SaveActivity(PostActivity = {
     CustomerID: req.user.id,
     ActivityName: 'Sent product offer to friend',
     ActivityDateTime: new Date()
     });
     }
     })
     })
     })
     }
     //NOT TOUCHED YET
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
     })*/
    // for checking if user is logged in before allowing user to access the page
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/logins');
    }

    // send mail with defined transport object
    function sendemail(mailOptions) {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        })
    }
}

