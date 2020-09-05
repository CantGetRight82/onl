const micro = require('micro');
const test = require('blue-tape');

let server = null;
let serveContent = {};
const serve = async(path, content, { contentType = 'text/javascript' }) => {
    serveContent[path] = {
        contentType,
        content,
    };
    if(!server) {
        const handleErrors = fn => async(req,res) => {
            try {
                return await fn(req,res);
            } catch(e) {
                micro.send(res, e.statusCode);
            }
        }
        server = micro(handleErrors(async (req, res) => {
            const entry = serveContent[req.url];
            if(!entry) {
                throw micro.createError(404);
            }
            res.setHeader('content-type', entry.contentType);
            res.setHeader('x-used-method', req.method);
            if(typeof(entry.content) === 'function') {
                return entry.content(req,res);
            }
            return entry.content;
        }));
        server.listen(3000);
    }
}
serve.clear = () => { serveContent = {}; }

module.exports = serve;

test.onFinish(async() => {
    await server.close();
});
