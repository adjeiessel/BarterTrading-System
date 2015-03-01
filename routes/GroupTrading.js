module.exports = function (app, dbconnection) {
//   GET home page.
    app.get('/GroupTrade', isLoggedIn, function (req, res) {
        var categories = [],servicecategory=[];
        var LogincustomerID = req.user.id;
        var GroupName = [];
        var Count = 0;
        dbconnection.query("Select * from Groups where CustomerID=?", [LogincustomerID], function (err, rows) {
            if (err) throw err
            if (rows) {
                for (var i in rows) {
                    GroupName[i] = rows[i].GroupName;
                    Count = rows.length;
                }
                console.log(GroupName);
            }
        });
        dbconnection.query("Select * from productcategories", function (err, rows) {
            if (err) throw err
            if (rows) {
                for (var i in rows) {
                    categories[i] = rows[i].CategoryName;
                }
                console.log(categories);
            }
        })
        dbconnection.query("Select * from ServiceCategory", function (err, rows) {

            if (err) throw err
            if (rows) {
                for (var i in rows) {
                    servicecategory[i] = rows[i].ServiceCatName;
                }
                console.log(categories);
            }
            res.render('pages/GroupTrade', {ProCategories: categories, YourGroups: GroupName,ServiceCat:servicecategory});
        })
    });
    app.post('/GroupTrade', function (req, res) {
        var GID, CatID, ServCatID;
        var PostData = {
            GroupName: req.body.GroupName,
            ProductCatName: req.body.CategoryName,
            ServiceCatName: req.body.ServiceCatName,
            CheckService:req.body.TradeOptionProduct
        };
        dbconnection.query('select CategoryID from ProductCategories where CategoryName=?', [PostData.ProductCatName], function (err, rows) {
            if (err) throw err
            if (rows) {
                for (var k in rows) {
                    CatID = rows[k].CategoryID;
                    console.log('Category ID', CatID);
                }
            }
            dbconnection.query('select GroupID from Groups where GroupName=?', [PostData.GroupName], function (errs, results) {
                if (errs) throw errs
                if (results) {
                    for (var a in results) {
                        GID = results[a].GroupID;
                        console.log('GroupID', GID);
                    }
                }
                dbconnection.query('select ServiceCatID from ServiceCategory where ServiceCatName=?', [PostData.ServiceCatName], function (err, rows) {
                    if (err) throw err
                    if (rows) {
                        for (var k in rows) {
                            ServCatID = rows[k].ServiceCatID;
                            console.log('ServiceID', ServCatID);
                        }
                    }
                    //Check which service is selected and allow for it's foreign key
                    if(PostData.CheckService=="Product"){
                       ServCatID=0;
                    }else if(PostData.CheckService=="Service"){
                        CatID=0;
                    }
                    //Create an object that will be submitted to the database
                    var SubmitAllData = {
                        GroupID: GID,
                        ProductService_Name: req.body.ProductServiceName,
                        ProductService_Details: req.body.ProductServiceDetails,
                        TradeSuccess: '0',
                        TradeDate: new Date(),
                        CategoryID: CatID,
                        ServiceCatID: ServCatID

                    };
                    dbconnection.query('Insert  into GroupTrade set? ', [SubmitAllData], function (err) {
                        if (err) throw err
                            console.log('Group Trade has Saved Successfully Created');
                        //save activity log
                        AddActivityLog(PostActivity={CustomerID:req.user.id,ActivityName:'Traded and item/service with your groupmembers: '+SubmitAllData.ProductService_Name,ActivityDateTime:new Date()});
                    })
                })
            })
        })
        res.redirect('/');
    });
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page   res.redirect('/');
        res.redirect('/logins');
    }
    function AddActivityLog(activityData){
        dbconnection.query('Insert  into ActivityLogs set? ', [activityData], function (err) {
            if (err) throw err
            console.log('Activity Saved');
        })
    }

};

