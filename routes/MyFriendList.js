/**
 * Created by ESSEL on 07-Feb-15.
 */
module.exports = function(app, dbconnection,AddNotification,SaveActivity) {
    var FriendID
    app.get('/MyFriendList', isLoggedIn, function (req, res) {
        dbconnection.query("Select * from FriendsList As F Join Customers As C on C.CustomerID=F.FriendID where F.CustomerID=? ",[req.user.id], function (err, Rows) {
            if (err) {
                console.log("Error Selecting : %s ", err);
            }
        res.render('pages/MyFriendList', {data: Rows});
        })
    });
    app.get('/MyFriendList/:id',function(req,res){
        var id = req.params.id;
        console.log(id);
        dbconnection.query("DELETE FROM FriendsList  WHERE  FriendListID=?",[id], function(err, rows)
        {
            if(err){
                console.log("Error deleting : %s ",err);
            }
            //save activity log
            SaveActivity(PostActivity={CustomerID:req.user.id,ActivityName:'Removed a friend from your trade Friend list:',ActivityDateTime:new Date()});
            res.redirect('/MyFriendList');
        });
    })
    app.get('/AcceptFriend/:id',function(req,res){
        var id = req.params.id;
        console.log(id);
        var Add={
            Status:'1'
        }
        dbconnection.query("Update FriendsList Set?  WHERE  FriendListID=?",[Add,id], function(err)
        {
            if(err){
                console.log("Error deleting : %s ",err);
            }
        })
            dbconnection.query('Select FriendID from FriendsList where FriendListID=?',[id],function(error,rows){
            if(error) throw error
                if(rows){
                    for (var i in rows){
                        FriendID=rows[i].FriendID
                    }
                }
                AddNotification(PostNotify={
                    CustomerID:req.user.id,
                    NotificationDetails:'Accepted your friend request. You can now trade with him/her',
                    FlagAsShown:'0',
                    ToCustomerID:FriendID,
                    NotificationDate:new Date()
                })
            })
            console.log('Accepted Friend');
            //save activity log
            SaveActivity(PostActivity={CustomerID:req.user.id,ActivityName:'Accepted friend request:',ActivityDateTime:new Date()});
            res.redirect('/MyFriendList');

    })
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }

}