const puppeteer = require('puppeteer-core');
const chromeLocation = require('chrome-location');
const test = require('blue-tape');

let browser = null;
const getBrowser = async() => {
    if(!browser) {
        browser = await puppeteer.launch({
            executablePath: chromeLocation,
            headless: true,
            // headless: false,
        });
    }
    return browser;
}


let page = null;
const getPage = async() => {
    if(!page) {
        const browser = await getBrowser();
        const pages = await browser.pages();
        page = pages[0];
        page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i)
                console.log(`${i}: ${msg.args()[i]}`);
        });
        page.on('error', msg => {
            console.log(msg);
        });
    }
    return page;
}
test.onFinish(async() => {
    await browser.close();
});

module.exports = {
    getBrowser,
    getPage,
}
