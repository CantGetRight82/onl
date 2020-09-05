
const mergeObjects = function(object1, object2) {
    if(object1 === null && object2 !== null) { return object2; }
    if(object2 === null && object1 !== null) { return object1; }
    let key;

    if (typeof object1 !== 'object') {
        if (typeof object2 !== 'object') {
            return [object1, object2];
        }
        return object2.concat(object1);
    }
    if (typeof object2 !== 'object') { return object1.concat(object2); }

    for (key in object2) {
        if ((Array.isArray(object1[key])) && (Array.isArray(object2[key]))) {
            object1[key] = object1[key].concat(object2[key]);
        } else if (typeof object1[key] === 'object' && typeof object2[key] === 'object') {
            object1[key] = mergeObjects(object1[key], object2[key]);
        } else {
            object1[key] = object2[key];
        }
    }
    return object1;
};

const createInstance = () => {
    let defaults = {
        baseURL: '',
        headers: {
            common: {},
        },
    };

    const requestInterceptors = [];
    const interceptors = {
        request: {
            use: (ok,fail) => {
                requestInterceptors.push(ok, fail);
            }
        },
    }
    const main = async function(config) {
        const fallbacks = {
            method: 'get',
            url: '',
            data: null,
            withCredentials: false,
            responseType: 'json',
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            },
            timeout: 0,
        }

        const defaultsWithoutHeaders = Object.assign({}, defaults);
        delete defaultsWithoutHeaders.headers;

        config = Object.assign(defaultsWithoutHeaders, fallbacks, config);
        config.headers = Object.assign(defaults.headers.common, config.headers);

        let promise = Promise.resolve(config);
        for(let i=0; i<requestInterceptors.length; i+=2) {
            promise = promise.then(requestInterceptors[i], requestInterceptors[i+1]);
        }

        promise = promise.then((config) =>  {
            return new Promise((ok,fail) => {
                const xhr = new XMLHttpRequest();
                xhr.addEventListener('load', function() {
                    let data = this.responseText;
                    if(config.responseType === 'json' && data !== '') {
                        data = JSON.parse(data);
                    }
                    const response = {
                        data,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: Object.fromEntries(xhr.getAllResponseHeaders().trim().split('\r\n').map(s => {
                            const colon  = s.indexOf(':');
                            return [ s.substr(0,colon).toLowerCase(), s.substr(colon+2) ];
                        })),
                    }
                    if(!config.validateStatus(xhr.status)) {
                        return fail({
                            response,
                            request: xhr,
                            config,
                        });
                    }
                    ok({
                        ...response,
                        config,
                        request: xhr,
                    });
                });

                const onFail = () => {
                    return fail({
                        config,
                        request: xhr,
                    });
                }
                xhr.addEventListener('timeout', onFail);
                xhr.addEventListener('abort', onFail);
                xhr.addEventListener('error', onFail);

                const baseURL = config.baseURL;
                const url = baseURL + config.url;
                xhr.open(config.method.toUpperCase(), url);
                xhr.timeout = config.timeout;

                const { headers } = config;
                for(let name in headers) {
                    xhr.setRequestHeader(name, headers[name]);
                }
                const { data } = config;
                if(typeof(data) === 'object') {
                    xhr.send(JSON.stringify(data));
                } else {
                    xhr.send(config.data);
                }
            });
        });
        return promise;
    }
    const genHelper = (method) => async(url, config) => main({ url, method, ...config });
    const genDataHelper = (method) => async(url, data, config) => main({ url, method, data, ...config });

    return Object.assign(main, {
        defaults,
        interceptors,
        get: genHelper('get'),
        delete: genHelper('delete'),
        post: genDataHelper('post'),
        put: genDataHelper('put'),
        patch: genDataHelper('patch'),
    });

}





export default createInstance();
