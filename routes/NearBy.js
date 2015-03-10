/**
 * Created by ESSEL on 10-Mar-15.
 */
module.exports = function (app, dbconnection, transporter, myio) {
// listen for incoming connections from client
    myio.sockets.on('connection', function (socket) {

        // start listening for coords
        socket.on('send:coords', function (data) {

            // broadcast your coordinates to everyone except you
            socket.broadcast.emit('load:coords', data);
        });
    });
    app.get('/NearBy', function (req, res) {
        res.render('pages/NearBy.ejs');
    })
};