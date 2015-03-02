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
            //Think of removing it , if is not going to be neccessary or putting it at final agreement stage
            dbconnection.query('Update ProductOffers  As P Join PeerTrade As PT On PT.FirstFriendProductOfferID=P.ProductOfferID set? where PT.PeerTradeID=? ', [ProductStatus, PeerTradeID], function (err) {
                if (err) throw err
                console.log('product status updated');
            })
            res.redirect('/');
        } else {
            //NB think of not updating yet because link expires if customer doesn't not offer immidiately
            var PeerTrade = {
                TradeStatus: 'Accepted'
            }
            dbconnection.query('Update PeerTrade set? where PeerTradeID=? ', [PeerTrade, PeerTradeID], function (err) {
                if (err) throw err
            })
            dbconnection.query('Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on PT.FriendListID=F.FriendListID where PeerTradeID=? ', [PeerTradeID], function (err, rows) {
                if (err) throw err

                //get all product categories from db into the select optionBox
                dbconnection.query("Select * from productcategories", function (err, prorows) {
                    if (err) {
                        console.log("Error Selecting : %s ", err);
                    }
                    dbconnection.query("Select * from ServiceCategory", function (err, servicerows) {
                        if (err) {
                            console.log("Error Selecting : %s ", err);
                        }
                        console.log('Peer Trade Accepted');
                        //redirect to RespondPeerTrade to allow customer to also make an offer and notify customer via email and notification
                        res.render('pages/RespondPeerTrade', {
                            CustomerDetails: rows,
                            ProCategories: prorows,
                            SerCategories: servicerows,
                            PeerID: PeerTradeID
                        });
                    });
                });
            });

        }
    })
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

