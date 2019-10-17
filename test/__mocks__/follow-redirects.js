const IncomingMessage = require('http').IncomingMessage;

let options = {
  statusCode: 200
};

function mockSetup(mock) {
  options = mock;
}

function request(settings, func) {
  let body = new IncomingMessage();
  Object.assign(body, options.body || {}, {
    input: settings,
    setEncoding: () => {},
    headers: options.headers || {},
    statusCode: options.statusCode,
    url: settings.url,
    responseUrl: settings.url,
  });
  body.headers.usedmethod = settings.method;
  body.headers.usedheaders = JSON.stringify(Object.keys(settings.headers)
    .filter((k) => k.startsWith('_'))
    .reduce((acc, k) => {
      acc[k] = settings.headers[k];
      return acc;
    }, {}));
  setImmediate(() => func(body));

  return {
    abort: () => { },
    on: (type, callback) => {
      if (type === 'error' && options.error) {
        setImmediate(() => callback(new Error('Request Error!')));
      }
    },
    end: () => {}
  }
}

function Agent() {}

module.exports = {
  http: { request, Agent },
  https: { request, Agent },
  mockSetup
};
