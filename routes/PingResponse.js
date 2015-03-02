/**
 * Created by ESSEL on 23-Feb-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {
    app.get('/PingResponse/:id/:pid', isLoggedIn, function (req, res) {
        //Update the productPingOffers
        //respond to customer pings or interests
        var PingID = req.params.id;
        var interestedproductID = req.params.pid
        //Get the ID of the product the responding Customer is interested in
        var productOfferID
        //Get the ID of the Responding Customer
        var RespondingCustomerID = req.user.id
        dbconnection.query("Select ProductOfferID from ProductOfferPings where PingID=?", [PingID], function (err, pingrows) {
            if (err) {
                console.log(err);
            }
            if (pingrows) {
                for (var i in pingrows) {
                    productOfferID = pingrows[i].ProductOfferID

                }
            }
            //Get the details of the interested Customer( email,productname and the first name of the customer who posted the item the
            // responding customer is interested in)
            var EmailAdd, fname, productname, PostedCustomerID, urllink;
            dbconnection.query('Select EmailAddress,FirstName,ProductName, P.CustomerID As ID from Customers As C Join ProductOffers As P on C.CustomerID=P.CustomerID where ProductOfferID=?', [interestedproductID], function (err, rows) {
                if (err) throw err
                if (rows) {
                    for (var i in rows) {
                        PostedCustomerID = rows[i].ID
                        EmailAdd = rows[i].EmailAddress;
                        fname = rows[i].FirstName;
                        productname = rows[i].ProductName;
                    }
                }
                //Prepare the update the productofferpings setting the tradestatus to responded
                var PostPingResponse = {
                    PostedCustomerID: RespondingCustomerID,
                    InterestedProductID: interestedproductID,
                    PingStatus: '1',
                    TradeStatus: 'Responded',
                    ResponseDate: new Date()
                }
                dbconnection.query('Update ProductOfferPings set? where InterestedCustomerID=? and ProductOfferID=? ', [PostPingResponse, PostedCustomerID, productOfferID], function (err, rows) {
                    if (err) throw err
                    console.log('Customer Responded to ping');
                })

                urllink = "http://" + req.get('host') + "/AcceptOffers/" +PingID

                var mailOptions = {
                    to: EmailAdd, // list of receivers
                    subject: 'Customer Response', // Subject line
                    html: 'Hello ' + req.user.FN + ',<br><br> ' + fname + ' has responded to your ping and is also interested in this product of yours ' + productname + '.<br> Please ' +
                    'accept or decline offer if you do not wish to trade your item for such an offer.<br><br><a href="' + urllink + '">Accept Offer</a><br><br>Thank you!<br>Barter Trading Team </br>'
                };
                // send mail with defined transport object
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent:');
                    }
                })
                //Add activity
                //save activity
                SaveActivity(PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'You responded to customer ping/interested in your product',
                    ActivityDateTime: new Date()
                })
                //Add notification
                AddNotification(PostNotify = {
                    CustomerID: req.user.id,
                    NotificationDetails: 'Responded your ping,please check details from your email adddress',
                    FlagAsShown: '0',
                    ToCustomerID: PostedCustomerID,
                    NotificationDate: new Date()

                })
            })
        })
        res.redirect('/ViewOffersServices');
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