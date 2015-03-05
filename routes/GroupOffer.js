/**
 * Created by ESSEL on 05-Mar-15.
 */
module.exports = function (app, dbconnection, transporter, SaveActivity, AddNotification) {

    app.get('/GroupOffer/:id', isLoggedIn, function (req, res) {
        //get the details of the product posted to customer
        var GroupTradeID = req.params.id;
        var ProductStatus = 'Available';
        dbconnection.query("Select * from ProductOffers As P Join GroupTrade As G on P.ProductOfferID=G.ProductOfferID Join ProductCategories As C on P.CategoryID=C.CategoryID Join Groups As GP on GP.GroupID=G.GroupID where GroupTradeID=? and ProductStatus=?", [GroupTradeID, ProductStatus], function (err, rows) {
            if (err) {
                console.log(err);
            }
            res.render('pages/GroupOffer', {GroupTrade: rows});
        })
    });
    app.post('/GroupOffer/:id', isLoggedIn, function (req, res) {
        //Accept or declined
        //Get the name of the user who is interested in the offer
        var GroupTradeID = req.params.id;
        var CustomerID = req.user.id;
        var GroupName, EmailAddress;
        dbconnection.query('Select GroupName,EmailAddress from Customers As C Join GroupMembers As GM On C.CustomerID=GM.MemberID ' +
        'Join Groups As G on G.GroupID=GM.GroupID Join GroupTrade As T On T.GroupID=G.GroupID Where GroupTradeID=?', [GroupTradeID], function (error, rows) {
            if (error)throw error
            if (rows) {
                for (var i in rows) {
                    GroupName = rows[i].GroupName;
                    EmailAddress = rows[i].EmailAddress;
                }
            }
            if (req.body.Decline == 'Decline') {

                var TradeStatus = 'Declined';

                dbconnection.query("Update GroupTrade set? where GroupTradeID=?", [TradeStatus, GroupTradeID], function (err) {
                    if (err)throw err
                    console.log('Update group trade');
                })
                //send link to all members about the interest and for them to also see what a member also has to offer
                var urllink = "http://" + req.get('host') + "/GroupOffer/" + GroupTradeID
                var mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: EmailAddress, // list of receivers
                    subject: 'Group Member Response', // Subject line
                    html: 'Hello ' + GroupName + 'Group Members<br><br>' + req.user.FN + ' is not interested in the product/item offered to the group.' +
                    'Thank you!<br>Barter Trading Team </br>'
                };
                sendemail(mailOptions);
                //save activity log
                SaveActivity(PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Declined offer in group',
                    ActivityDateTime: new Date()
                });
            } else {
                var TradeStatus = 'Interested';
                dbconnection.query("Update GroupTrade set? where GroupTradeID=?", [TradeStatus, GroupTradeID], function (err) {
                    if (err)throw err
                    console.log('Update group trade');
                })
                //send link to all members about the interest and for them to also see what a member also has to offer
                var urllink = "http://" + req.get('host') + "/GroupOffer/" + GroupTradeID

                var mailOptions = {
                    from: 'B-Commerce <adjeiessel@gmail.com',
                    to: EmailAddress, // list of receivers
                    subject: 'Group Member Response', // Subject line
                    html: 'Hello ' + GroupName + 'Group Members<br><br>' + req.user.FN + ' is interested in the product/item you offered to the group. <br><br>Please' +
                    'open the link below to see what he/she also has to offer if you are interested<br> to trade your product/item for that offer.' +
                    '<br><br><a href="' + urllink + '">Click to check offer</a><br><br>' +
                    'Thank you!<br>Barter Trading Team </br>'
                };
                sendemail(mailOptions);
                //save activity log
                SaveActivity(PostActivity = {
                    CustomerID: req.user.id,
                    ActivityName: 'Interested in offer to Group',
                    ActivityDateTime: new Date()
                });
            }

        })
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

