
// server.js
const express        = require('express');
//const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
//const db             = require('./config/db');
const app            = express();
// const https = require('https');
const request = require('request');
const port = 1337;
const path = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d53441c9-5d6d-43d8-84ac-945549ae12d4?subscription-key=a71922e0a1f7439cb4c05612e074603c&timezoneOffset=-360&q=';
app.use(bodyParser.urlencoded({ extended: true }));
//MongoClient.connect(db.url, (err, database) => {
//  if (err) return console.log(err)
//  require('./app/routes')(app, database);
//  app.listen(port, () => {
//    console.log('We are live on ' + port);
//  });
//})

app.get('/', function (req, res) {
    //console.log(req);
   // var queryOrder = JSON.stringify(req.query);

    let query = req.query.query;

    console.log("this is what i got " + query);


   //  const propertiesObject = { q: userQuery.query};
    const propertiesObject = { q: query};

    request({url:path, qs:propertiesObject}, function(err, response, body) {
    if(err) { console.log(err); return; }
        console.log("Get response: " + response.statusCode);
        console.log(response.body);

        // var intent = response.body.topScoringIntent.intent;
        body = JSON.parse(body);
        var foodName, quantity, restaurantName, foodSize;
        body.entities.map(element => {
            if (element.type === 'QuantityOfFood'){
                this.quantity = element.entity;
            }
            if (element.type === 'FoodName'){
                this.foodName = element.entity;
            }
            if (element.type === 'RestaurantName'){
                this.restaurantName = element.entity;
            }
            if (element.type === 'FoodSize'){
               this.foodSize = element.entity;
            }
        });

        //res.send("quantity "+this.quantity + "QuantityOfFood " + this.restaurantName);
        var data =  [
            {"text": "Ahh I see, you want to order "+this.quantity+" "+this.foodName+" from "+this.restaurantName}
        ];

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ "messages":  data}, null, 3));
    });

    // res.send('ready to rock and roll!' + );
});


app.listen(port, () => {
    console.log('We are live on ' + port);
});
