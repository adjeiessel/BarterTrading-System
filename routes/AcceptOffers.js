/**
 * Created by ESSEL on 26-Feb-15.
 */
module.exports = function(app,dbconnection,transporter,SaveActivity,AddNotification) {
    var interestedCustomerEmail
    var PostCustomerName
    var InterestedCustomerName
    var InterestedCustomerProduct
    var PostedCusProductID
    var InterCusProductID
    var PostedCustomerProduct
    var InterestedCustomerID
    app.get('/AcceptOffers/:id',isLoggedIn,function(req,res) {
        //Get the PingID and use it to show the offer both parties are looking at
        //use it to either accept or decline
        var pingID = req.params.id;
        var tradestatus='Responded';
        //shows the PostedCutomerID
        dbconnection.query("Select * from ProductOffers As P Join ProductOfferPings As O on P.ProductOfferID=O.ProductOfferID Join Customers As C on C.CustomerID=O.PostedCustomerID where pingID=? and TradeStatus=?", [pingID,tradestatus], function (err, row) {
            if (err) {
                console.log(err);
            }
            if(row){
                for(var i in row){
                    PostCustomerName=row[i].FirstName+' '+row[i].LastName+''+row[i].MiddleName
                    PostedCusProductID=row[i].ProductOfferID
                    PostedCustomerProduct=row[i].ProductName
                }
            }
            //shows what the interested customer has to offer
            dbconnection.query("Select * from ProductOffers As P Join ProductOfferPings As O on P.ProductOfferID=O.InterestedProductID Join Customers As C on C.CustomerID=O.InterestedCustomerID where pingID=? and TradeStatus=?", [pingID, tradestatus], function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if(rows){
                    for(var i in rows){
                        InterestedCustomerID=rows[i].InterestedCustomerID
                       InterCusProductID=rows[i].InterestedProductID
                        interestedCustomerEmail=rows[i].EmailAddress;
                        InterestedCustomerName=rows[i].FirstName+' '+rows[i].LastName+''+rows[i].MiddleName
                        InterestedCustomerProduct=rows[i].ProductName
                    }
                }
                res.render('pages/AcceptOffers', {FirstCustomerResults: row,SecondCustomerResults:rows});
            })
        })
    })
    app.post('/AcceptOffers/:id',isLoggedIn,function(req,res) {
        var pingID = req.params.id;
        var tradestatus,ProductStatus,Activity
        if(req.body.Decline=='Declined'){
          tradestatus='Declined'
            ProductStatus='Available'
            Activity='Declined Offer from '+InterestedCustomerName
        }else{
            tradestatus='Accepted'
            ProductStatus='Traded Out'
            Activity='Accepted Offer from '+InterestedCustomerName
        }
        var AcceptOffer={
            TradeStatus:tradestatus,
            DecisionDate:new Date()
        }
        var mailOptions = {
            to: interestedCustomerEmail, // list of receivers
            subject: 'Offer Accepted', // Subject line
            html:'Hello '+ InterestedCustomerName+',<br><br> '+  PostCustomerName +' has accepted to trade with you '+ PostedCustomerProduct +' for '+ InterestedCustomerProduct +'. Please ' +
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
        dbconnection.query('Update ProductOfferPings set? where PingID=?', [AcceptOffer,pingID], function (err) {
            if(err) throw err
            console.log('Trade Completed');
        })
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus,PostedCusProductID], function (err) {
            if(err) throw err
            console.log('First Product Status Updated');
        })
        dbconnection.query('Update ProductOffers set ProductStatus=? where ProductOfferID =?', [ProductStatus,InterCusProductID], function (err) {
            if(err) throw err
            console.log('Second Product Status Updated');
        })
        //save activity
        SaveActivity(PostActivity={CustomerID:req.user.id,ActivityName:Activity ,ActivityDateTime:new Date()})
        //Add notification
        AddNotification(PostNotify={
            CustomerID:req.user.id,
            NotificationDetails:'Accepted your offer',
            FlagAsShown:'0',
            ToCustomerID:InterestedCustomerID,
            NotificationDate:new Date()

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