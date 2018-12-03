
// server.js
const express        = require('express');
//const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
//const db             = require('./config/db');
const mongo = require('mongodb');

const puppeteer = require('puppeteer');

const app            = express();
// const https = require('https');
const request = require('request');
const port = 1337;
const path = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d53441c9-5d6d-43d8-84ac-945549ae12d4?subscription-key=a71922e0a1f7439cb4c05612e074603c&timezoneOffset=-360&q=';


const ORDERFOOD = 'OrderFood';
const QUERYONMENU = 'QueryOnMenu';
const CONFIRMED = 'Utilities.Confirm';


app.use(bodyParser.urlencoded({ extended: true }));
//MongoClient.connect(db.url, (err, database) => {
//  if (err) return console.log(err)
//  require('./app/routes')(app, database);
//  app.listen(port, () => {
//    console.log('We are live on ' + port);
//  });
//})

app.get('/', function (req, res) {
    let query = req.query.query;
    console.log("this is what i got " + query);
    let data = [];
    let array = [];
    res.setHeader('Content-Type', 'application/json');

    //  const propertiesObject = { q: userQuery.query};
    const propertiesObject = { q: query};

    request({url:path, qs:propertiesObject}, function(err, response, body) {
        if(err) { console.log(err); return; }
        console.log("Get response: " + response.statusCode);
        console.log(response.body);

        body = JSON.parse(body);
        let intent = body.topScoringIntent.intent;
        let foodName, quantity, restaurantName, foodSize;

        let MongoClient = require('mongodb').MongoClient;
        const assert = require('assert');


        let url = "mongodb+srv://strapi:Hyh83345511!@cluster0-tds3s.mongodb.net/test?retryWrites=true";

        switch(intent){
            case ORDERFOOD:

                body.entities.map(element => {
                    if (element.type === 'QuantityOfFood'){
                        quantity = element.entity;
                    }
                    if (element.type === 'FoodInKiwa'){
                        foodName = element.entity;
                    }
                    if (element.type === 'RestaurantName'){
                        restaurantName = element.entity;
                    }
                    if (element.type === 'FoodSize'){
                        foodSize = element.entity;
                    }
                    let message;
                    if (this.restaurantName === undefined){
                        message = "Ahh I see, you want to order "+quantity+" "+foodName;
                    }else{
                        message = "Ahh I see, you want to order "+quantity+" "+foodName+" from "+restaurantName;
                    }

                    data =  [
                        {"text": message}
                    ];
                });


                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("mydb");
                    var myobj = { foodName: foodName, quantity: quantity };
                    dbo.collection("orders").insertOne(myobj, function(err, res) {
                        if (err) throw err;
                        console.log("1 document inserted");
                        db.close();
                    });
                });
                res.send(JSON.stringify({ "messages":  data}));

                break;
            case QUERYONMENU:
                data = [
                    {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "text": "Here is the menu of the restaurant, check it out!!",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://www.skipthedishes.com/kiwa-korean-cuisine/order",
                                        "title": "Visit Website"
                                    },
                                ]
                            }
                        }
                    }
                ]
                array = [
                    "Typing","AfterCheckingMenu",
                ]

                res.send(JSON.stringify({ "messages":  data,"redirect_to_blocks": array}));

                break;
            case CONFIRMED:

                var message = "Your order is processing, thank you for using!";
                array = [
                    "Done"
                ]

                data =  [
                    {"text": message}
                ];

//get only one query!!!!
                // MongoClient.connect(url, function(err, db) {
                //     if (err) throw err;
                //     var dbo = db.db("mydb");
                //     dbo.collection("orders").findOne().toArray(function(err, result) {
                //         if (err) throw err;
                //         console.log(result.foodName);
                //         //TODO pass to ording function!!!!
                //         db.close();
                //     });
                // });

//get drop DB !!!!!

                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    var dbo = db.db("mydb");
                    dbo.collection("orders").drop(function(err, delOK) {
                        if (err) throw err;
                        if (delOK) console.log("Collection deleted");
                        db.close();
                    });
                });

                res.send(JSON.stringify({ "messages":  data,"redirect_to_blocks": array }));

                break;
            default:

                array = [
                    "Typing", "Default Answer"
                ]
                res.send(JSON.stringify({"redirect_to_blocks": array}));
        }

    });

    // res.send('ready to rock and roll!' + );

});


app.listen(port, () => {
    console.log('We are live on ' + port);
});


function simulateOrder(itemName){
    (async () => {
      try{
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        
        page.on('console', consoleObj => console.log(consoleObj.text()));
        page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');
    
        await page.goto('//www.skipthedishes.com/user/login/');
    
    
        await page.waitForSelector('.form-control');
        await page.type('#email','murun.enkhee@gmail.com');
        await page.type('#password','123456');
        await page.click('#submit-btn');
    
        await page.waitForSelector('.styled-select-container');
    
        
        await page.select('select.form-control.user-address','04ea2990-76be-437f-beeb-18aa98a1cee0');
        await page.click('#btn-delivery');
        await page.waitForSelector('.address-add-new-action');
    
        await page.evaluate(() => {
          document.querySelector('.address-add-new-action').click();
        })
    
        await page.waitForSelector('#restaurant-search');
        await page.type('#restaurant-search','kiwa');
    
        const restaurants = await page.evaluate(() => {
          const restaurants = Array.from(document.querySelectorAll('#restaurant-list-container > a'));
    
          return restaurants.map((res) => {
            let obj = {};
    
            obj['name'] = res.getAttribute('data-restaurant-name-searchable');
            obj['link'] = res.getAttribute('href');
            return obj;
          });
    
    
        });
    
        const filteredRest = restaurants.filter(res => {
          return res.name.includes(restName);
        });
       
        console.log(filteredRest[0].link.substring(1));
        await page.goto( 'https://www.skipthedishes.com/${filteredRest[0].link.substring(1)}/order' );
    
        await page.waitForSelector('.menu-item');
    
    
        await page.evaluate((itemName) => {
          const foods_selectors = Array.from(document.querySelectorAll('.menu-item'));
          for (let i = 0; i < foods_selectors.length; i++) {
            if (foods_selectors[i].getAttribute('data-menu-item-name').toLowerCase().includes(itemName)) {
              foods_selectors[i].click();
              break;
            }
          }
        }, itemName);
    
        await page.waitForSelector('.button-add-to-order');
        await page.waitFor(1000);
        await page.evaluate(() => {
          console.log('inside button');
          document.querySelector('.button-add-to-order').click();
          console.log('button clicked');
        });
    
       
        await page.waitForSelector('.checkout-button');
        await page.waitFor(1000);
        await page.evaluate(() => {
        //  console.log('inside button');
          document.querySelector('.checkout-button').click();
        //  console.log('button clicked');
        });
    
        
        await page.waitForSelector('.checkout-create-order');
        await page.waitFor(1000);
        await page.evaluate(() => {
        //  console.log('inside button');
          document.querySelector('.checkout-create-order').click();
        //  console.log('button clicked');
        });
    
        await page.waitForSelector('#payment-methods-dropdown');
        await page.waitFor(1000);
    
        await page.evaluate(() => {
          const payments = Array.from(document.querySelectorAll('#payment-methods-dropdown > ul > li'));
          payments[1].querySelector('a').click();
        });
    
        await page.waitForSelector('#checkout-payment-modal-btn');
        await page.evaluate(() => {
        //  console.log('inside button');
          document.querySelector('#checkout-payment-modal-btn').click();
        //  console.log('button clicked');
        });
    
        const confirmationMessage = await page.evaluate(() => {
            let obj = {};
            obj['waitTime'] = document.querySelector('.checkout-map-details-time').textContent;
            obj['totalAmount'] = document.querySelector('.checkout-cart-total').textContent;
            return obj;
        });
        console.log(confirmationMessage);
        
        await page.screenshot({path: 'skip.png'});
      
        //await browser.close();
      }
      catch(e){
        console.log('error',e);
      }
    })();
};