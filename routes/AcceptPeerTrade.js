/**
 * Created by ESSEL on 26-Feb-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
    var FirstCustomerName, FirstCustomerEmail, FirstCustomerProduct, FID
    var SecondCustomerName, SecondCustomerEmail, SecondCustomerProduct, SID
    app.get('/AcceptPeerTrade/:id', isLoggedIn, function (req, res) {
        //Get the PeertradeID and use it to show the offer both parties are looking at
        //use it to either accept or decline
        var peerTradeID = req.params.id;
        var tradestatus = 'Interested';
        //shows the PostedCutomerID
        dbconnection.query("Select * from Customers As  C Join FriendsList As F on C.CustomerID=F.CustomerID Join PeerTrade As PT on PT.FriendListID=F.FriendListID Join ProductOffers AS P on P.ProductOfferID=PT.FirstFriendProductOfferID where PeerTradeID=? and TradeStatus=?", [peerTradeID, tradestatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            if (row) {
                for (var i in row) {
                    FirstCustomerName = row[i].FirstName + ' ' + row[i].LastName + '' + row[i].MiddleName;
                    FirstCustomerEmail = row[i].EmailAddress;
                    FirstCustomerProduct = row[i].ProductName;
                    FID = row[i].CustomerID;
                }
            }
            //shows what the interested customer has to offer
            dbconnection.query("Select * from  Customers As  C Join FriendsList As F on C.CustomerID=F.FriendID Join PeerTrade As PT on PT.FriendListID=F.FriendListID Join ProductOffers AS P on P.ProductOfferID =PT.SecondFriendProductOfferID where PeerTradeID=? and TradeStatus=?", [peerTradeID, tradestatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (rows) {
                    for (var i in rows) {
                        SecondCustomerEmail = rows[i].EmailAddress;
                        SecondCustomerName = rows[i].FirstName + ' ' + rows[i].LastName + '' + rows[i].MiddleName;
                        SecondCustomerProduct = rows[i].ProductName;
                        SID = row[i].CustomerID;
                    }
                }
                res.render('pages/AcceptPeerTrade', {FirstCustomerResults: row, SecondCustomerResults: rows});
            })
        })
    })
    app.post('/AcceptPeerTrade/:id', isLoggedIn, function (req, res) {
        var PeerID = req.params.id;
        var tradestatus, ProductStatus, Activity
        if (req.body.Decline == 'Declined') {
            tradestatus = 'Declined'
            ProductStatus = 'Available'
            Activity = 'Declined Offer from ' + FirstCustomerName
        } else {
            tradestatus = 'Accepted'
            ProductStatus = 'Traded Out'
            Activity = 'Accepted Offer from ' + SecondCustomerName
        }
        var AcceptOffer = {
            TradeStatus: tradestatus,
            DecisionDate: new Date()
        }
        var mailOptions = {
            to: FirstCustomerEmail + ', ' + SecondCustomerEmail,// list of receivers
            subject: 'Peer Trade Completed', // Subject line
            html: 'Hello, <br><br> Your trade between <b>' + FirstCustomerName + ' </b> and <b>' + SecondCustomerName + '</b> has successfully been completed.<br>Please ' +
            'be ready to ship the item/product to your friend.<br>Shipping address can be found under their profile.<br><br>Thank you for using our service!<br>Barter Trading Team!</br>'
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent:');
            }
        })
        var PeerTrade = {
            TradeStatus: tradestatus
        }
        var ProductStatus = {
            ProductStatus: ProductStatus
        }
        dbconnection.query('Update ProductOffers  As P Join PeerTrade As PT On PT.FirstFriendProductOfferID=P.ProductOfferID set? where PT.PeerTradeID=? ', [ProductStatus, PeerID], function (err) {
            if (err) throw err
            console.log('First Product Status Updated');
        })
        dbconnection.query('Update PeerTrade set? where PeerTradeID=?', [PeerTrade, PeerID], function (errs) {
            if (errs) throw errs
            console.log('Second Product Status Updated');
        })
        //save activity
        SaveActivity(PostActivity = {CustomerID: req.user.id, ActivityName: Activity, ActivityDateTime: new Date()})
        //Add notification
        AddNotification(PostNotify = {
            CustomerID: FID,
            NotificationDetails: 'Peer Trade Completed',
            FlagAsShown: '0',
            ToCustomerID: SID,
            NotificationDate: new Date()

        })
        AddNotification(PostNotify = {
            CustomerID: SID,
            NotificationDetails: 'Peer Trade Completed',
            FlagAsShown: '0',
            ToCustomerID: FID,
            NotificationDate: new Date()

        })
        res.redirect('/');
    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
}