/**
 * Created by ESSEL on 26-Feb-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
    var MemberEmail;
    var MemberName;
    var GroupOwner;
    var GroupOwnerProductOffer;
    var MemberProductOffer;
    var TradeID;
    app.get('/MemberOffer/:id', isLoggedIn, function (req, res) {
        //Get the member offerID
        var memberID = req.params.id;
        var tradestatus = 'Interested';
        var productStatus = 'Pending Acceptance';
        var OwnerProductStatus = 'Available';
        var GroupTradeID, Groupownername;
        var GroupMemberName;

        //Gets the Product Posted by first Group Member: Group Owner
        dbconnection.query("Select * from ProductOffers As P Join GroupTrade As GT on P.ProductOfferID=GT.ProductOfferID Join GroupMemberOffer As GM on GM.GroupTradeID=GT.GroupTradeID " +
        "where memberOfferID=? and(TradeStatus=? and ProductStatus=?) ", [memberID, tradestatus, OwnerProductStatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            //Get the GroupTradeID
            if (row) {
                for (var i in row) {
                    GroupTradeID = row[i].GroupTradeID;
                    GroupOwnerProductOffer = row[i].ProductName;
                    TradeID = GroupTradeID;
                    console.log('Group Trade ID' + GroupTradeID);
                }
            }
            //Get the Offer made by the second customer: Member of the Group
            dbconnection.query("Select * from ProductOffers As P Join GroupMemberOffer As GM on P.ProductOfferID=GM.ProductOfferID Join GroupTrade As GT on GT.GroupTradeID=GM.GroupTradeID" +
            " where memberOfferID=? and (TradeStatus=? and ProductStatus=?)", [memberID, tradestatus, productStatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        MemberProductOffer[i].ProductName;
                    }
                }
                dbconnection.query("Select FirstName,LastName,MiddleName from Customers As C Join Groups As G On C.CustomerID=G.CustomerID Join GroupTrade As T  On T.GroupID=G.GroupID where GroupTradeID=?", [GroupTradeID], function (error, Gropownerrows) {
                    if (error) {
                        console.log(error);
                    }
                    if (Gropownerrows) {
                        for (var i in Gropownerrows) {
                            Groupownername = Gropownerrows[i].FirstName + ' ' + Gropownerrows[i].LastName + ' ' + Gropownerrows[i].MiddleName
                            GroupOwner = Groupownername;
                        }
                    }
                    //Get Member name
                    dbconnection.query("Select FirstName,LastName,MiddleName,EmailAddress from Customers As C Join GroupMemberOffer As GM on GM.CustomerID=C.CustomerID where memberOfferID=?", [memberID], function (error, memrows) {
                        if (error) {
                            console.log(error);
                        }
                        if (memrows) {
                            for (var i in memrows) {
                                GroupMemberName = memrows[i].FirstName + ' ' + memrows[i].LastName + ' ' + memrows[i].MiddleName;
                                MemberEmail = memrows[i].EmailAddress;
                                MemberName = GroupMemberName;
                            }
                        }

                        res.render('pages/AcceptMemberOffer', {
                            FirstCustomerResults: row,
                            SecondCustomerResults: rows,
                            MemberName: GroupMemberName,
                            OwnerName: Groupownername
                        });
                    })
                })
            })
        })
    })
    app.post('/MemberOffer/:id', isLoggedIn, function (req, res) {
        //interested or decline offer
        var memberID = req.params.id;
        var tradestatus, ProductStatus, Activity
        if (req.body.Decline == 'Declined') {
            tradestatus = 'Declined'
            ProductStatus = 'Available'
            Activity = 'Declined Offer from ' + MemberName
        } else {
            tradestatus = 'Accepted'
            ProductStatus = 'Traded Out'
            Activity = 'Accepted Offer from ' + MemberName
        }
        var AcceptOffer = {
            TradeStatus: tradestatus,
            DecisionDate: new Date()
        }
        var mailOptions = {
            from: 'B-Commerce <adjeiessel@gmail.com',
            to: MemberEmail, // list of receivers
            subject: 'Group Trade', // Subject line
            html: 'Hello ' + MemberName + ',<br><br> ' + GroupOwner + ' has accepted to trade with you ' + GroupOwnerProductOffer + ' for ' + MemberProductOffer + '. Please ' +
            'be ready to ship the item to the customer. Customer shipping address can be found under their profile.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        })
        dbconnection.query('Update GroupTrade set? where GroupTradeID=?', [AcceptOffer, TradeID], function (err) {
            if (err) throw err
            console.log('Group Trade Completed');
        });
        //update product status for each offer in the productoffer
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus, PostedCusProductID], function (err) {
            if (err) throw err
            console.log('First Product Status Updated');
        })
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus, InterCusProductID], function (err) {
            if (err) throw err
            console.log('Second Product Status Updated');
        })
        //save activity
        SaveActivity(PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()})
        //Add notification
        AddNotification(PostNotify = {
            CustomerID: req.user.id,
            NotificationDetails: 'Accepted your offer',
            FlagAsShown: '0',
            ToCustomerID: InterestedCustomerID,
            NotificationDate: new Date()

        })
        res.redirect('/');
        */
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
}