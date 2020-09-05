const micro = require('micro');
const fs = require('fs');
const serve = require('./serve');

module.exports = async() => {
    await serve.clear();
    await serve('/onl.js', await fs.promises.readFile(__dirname+'/../../onl.js'), {});
    await serve('/', `<script type="module"> import onl from './onl.js'; window.onl = onl; </script>`, { contentType:'text/html' });
    await serve('/echo', async(req, res) => {
        const obj = await micro.json(req);
        return obj;
    }, { contentType:'application/json' });
    await serve('/empty', '', { contentType:'application/json' });

}

