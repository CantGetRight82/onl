const fs = require('fs');
const micro = require('micro');

const test = require('blue-tape');
const serve = require('./helpers/serve');
const serveDefaults = require('./helpers/serve-defaults');

const { getPage } = require('./helpers/puppet');

test('A simple GET request works as expected', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/simple', { hello:'world' }, { contentType:'application/json' });

    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => onl.get('/simple'));
    t.deepEqual(result.data, { hello:'world' });
    t.equal(result.status, 200);
    t.equal(result.statusText, 'OK');
    t.equal(result.headers['content-type'], 'application/json');
    t.equal(result.headers['x-used-method'], 'GET');
});

test('A simple POST request works as expected', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => onl.post('/echo', { hello:'post' }));
    t.deepEqual(result.data, { hello:'post' });
    t.equal(result.headers['x-used-method'], 'POST');
});

test('A simple PUT request works as expected', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => onl.put('/echo', { hello:'put' }));
    t.deepEqual(result.data, { hello:'put' });
    t.equal(result.headers['x-used-method'], 'PUT');
});

test('A simple PATCH request works as expected', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => onl.patch('/echo', { hello:'patch' }));
    t.deepEqual(result.data, { hello:'patch' });
    t.equal(result.headers['x-used-method'], 'PATCH');
});

test('A simple DELETE request works as expected', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => onl.delete('/empty'));
    t.deepEqual(result.data, '');
    t.equal(result.headers['x-used-method'], 'DELETE');
});

