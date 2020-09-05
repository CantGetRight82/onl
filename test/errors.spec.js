const fs = require('fs');
const micro = require('micro');

const test = require('blue-tape');
const serve = require('./helpers/serve');
const serveDefaults = require('./helpers/serve-defaults');
const { getPage } = require('./helpers/puppet');


test('The request was made and the server responded with a status code that falls out of the range', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
        return onl.get('/nonexistent').catch(e => {
            return Promise.resolve(e);
        });
    });
    t.equal(result.response.data, '');
    t.equal(result.response.status, 404);
    t.equal(result.response.headers.connection, 'keep-alive');
});

test('The request was made but no response was received', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/too-long', async(req,res) => {
        await new Promise(ok => setTimeout(ok,200));
        return '';
    }, {});
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
        return onl.get('/too-long', { timeout: 100 }).catch(e => {
            return Promise.resolve(e);
        });
    });

    t.ok(result.response === undefined);
    t.ok(result.request !== undefined);
});

