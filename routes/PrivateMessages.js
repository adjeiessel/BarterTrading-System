
module.exports = function(app,dbconnection,transporter) {
  app.get('/PrivateMessages',function(req,res){
    res.render('pages/Messages',{Email:'',Name:''});
  })

  app.get('/search', function (req, res) {
    dbconnection.query('SELECT FirstName,LastName,MiddleName from customers where FirstName like "%' + req.query.key + '%"', function (err, rows) {
      if (err) throw err;
      var data = [];
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].FirstName+' '+rows[i].LastName+' '+rows[i].MiddleName);
      }
      res.end(JSON.stringify(data));
      console.log(JSON.stringify(data));
    });
  })
  app.get('/searchemail', function (req, res) {
    dbconnection.query('SELECT EmailAddress from customers where Concat(FirstName," ",LastName," ",MiddleName)=?' ,[ req.query.name], function (err, rows) {
    if (err) throw err;
    var emaildata = [];
    for (i = 0; i < rows.length; i++) {
      emaildata.push(rows[i].EmailAddress);
    }
    var email=JSON.stringify(emaildata);
    res.send(JSON.parse(email));
    console.log(JSON.stringify(emaildata));
  });
})
  app.get('/sendmessages', function (req, res) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'B-Commerce <adjeiessel@gmail.com',
      to: req.query.to, // list of receivers
      subject: req.query.subject, // Subject line
      text: req.query.text,// plaintext body
      attachments:{path:req.query.attachment}
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Message sent:');
      }
      res.render('pages/Messages');
    });
  });
  app.get('/PrivateMessages/:id', function (req, res) {
    var productID=req.params.id;
      dbconnection.query('SELECT EmailAddress,FirstName,LastName,MiddleName from Customers As C Join ProductOffers As P on C.CustomerID=P.CustomerID Where ProductOfferID=?', [productID], function (err, rows) {
      if (err) throw err;
      var emaildata,name;
      for (i = 0; i < rows.length; i++) {
        emaildata=(rows[i].EmailAddress);
          name = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
      }
      res.render('pages/Messages',{Email:emaildata,Name:name});
    });
  });

    app.get('/ServiceMessages/:id', function (req, res) {
        var serviceID = req.params.id;
        dbconnection.query('SELECT EmailAddress,FirstName,LastName,MiddleName from Customers As C Join ServiceOffers As S on C.CustomerID=S.CustomerID Where ServiceOfferID=?', [serviceID], function (err, rows) {
            if (err) throw err;
            var emaildata, name;
            for (i = 0; i < rows.length; i++) {
                emaildata = (rows[i].EmailAddress);
                name = rows[i].FirstName + ' ' + rows[i].LastName + ' ' + rows[i].MiddleName;
            }
            res.render('pages/Messages', {Email: emaildata, Name: name});
        });
    });
};

