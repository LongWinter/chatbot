const puppeteer = require('puppeteer');

const restName = 'kiwa';
const itemName = 'japchae';

(async () => {
  try{
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    
    page.on('console', consoleObj => console.log(consoleObj.text()));
    page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');

    await page.goto('https://www.skipthedishes.com/user/login/');

    await page.waitFor(3000);
    await page.waitForSelector('.form-control');
    await page.type('#email','murun.enkhee@gmail.com');
    await page.type('#password','123456');
    await page.click('#submit-btn');
    await page.waitFor(3000);
    await page.waitForSelector('.styled-select-container');

    
    await page.select('select.form-control.user-address','04ea2990-76be-437f-beeb-18aa98a1cee0');
    await page.click('#btn-delivery');
    await page.waitForSelector('.address-add-new-action');

    await page.evaluate(() => {
      document.querySelector('.address-add-new-action').click();
    })
    await page.waitFor(3000);
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
    await page.goto( `https://www.skipthedishes.com/${filteredRest[0].link.substring(1)}/order` );

    await page.waitForSelector('.menu-item');
    await page.waitFor(3000);


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
    await page.waitFor(3000);
    await page.evaluate(() => {
      console.log('inside button');
      document.querySelector('.button-add-to-order').click();
      console.log('button clicked');
    });

   
    await page.waitForSelector('.checkout-button');
    await page.waitFor(3000);
    await page.evaluate(() => {
    //  console.log('inside button');
      document.querySelector('.checkout-button').click();
    //  console.log('button clicked');
    });

    
    await page.waitForSelector('.checkout-create-order');
    await page.waitFor(3000);
    await page.evaluate(() => {
    //  console.log('inside button');
      document.querySelector('.checkout-create-order').click();
    //  console.log('button clicked');
    });

    await page.waitForSelector('#payment-methods-dropdown');
    await page.waitFor(3000);

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