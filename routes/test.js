/**
 * Created by ESSEL on 15-Feb-15.
 */
module.exports = function(app,dbconnection) {
    app.get('/test', function (req, res) {

        res.render('pages/test');
    });
    app.get('/test1', function (req, res) {
        dbconnection.query('SELECT FirstName from customers where FirstName like "%' + req.query.key + '%"', function (err, rows, fields) {
            if (err) throw err;
            var data = [];
            for (i = 0; i < rows.length; i++) {
                data.push(rows[i].FirstName);
            }
            res.end(JSON.stringify(data));
            console.log(JSON.stringify(data));
        });
    });


}