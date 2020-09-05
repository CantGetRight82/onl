const fs = require('fs');
const micro = require('micro');

const test = require('blue-tape');
const serve = require('./helpers/serve');
const serveDefaults = require('./helpers/serve-defaults');
const { getPage } = require('./helpers/puppet');


test('baseURL in defaults is used', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/something/simple', { hello:'world' }, { contentType:'application/json' });
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
        onl.defaults.baseURL = '/something';
        return onl.get('/simple')
    });
    t.deepEqual(result.data, { hello:'world' });
});

test('baseURL in options is used', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/something/simple', { hello:'world' }, { contentType:'application/json' });
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
        return onl.get('/simple', {
            baseURL: '/something',
        })
    });
    t.deepEqual(result.data, { hello:'world' });
});

test('Custom headers are sent from options', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/echo-headers', (req,res) => {
        return req.headers;
    }, { contentType:'application/json' });

    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
        return onl.get('/echo-headers', { headers: { 'x-custom-header': 'header-value' } });
    });
    t.equal(result.data['x-custom-header'], 'header-value');
});

test('Custom headers are sent from defaults', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/echo-headers', (req,res) => {
        return req.headers;
    }, { contentType:'application/json' });

    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
        onl.defaults.headers.common['x-custom-header'] = 'header-value';
        return onl.get('/echo-headers');
    });
    t.equal(result.data['x-custom-header'], 'header-value');
});

test('Timeout works as expected', async(t) => {
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


test('Interceptors work as expected', async(t) => {
    const page = await getPage();
    await serveDefaults();
    await serve('/echo-headers', (req,res) => {
        return req.headers;
    }, { contentType:'application/json' });
    await page.goto('http://localhost:3000');

    const result = await page.evaluate(() => {
        onl.interceptors.request.use(function (config) {
            console.log(config.headers);
            config.headers['x-auth'] = 'some token';
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });
        return onl.get('/echo-headers');
    });
    t.equal(result.data['x-auth'], 'some token');

});
test('TODO withCredentials works as expected', async(t) => {});
test('TODO throws errors when trying unsupported stuff', async(t) => {});
