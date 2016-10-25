'use strict';

const isPlainObject = require('is-plain-object');

const DefaultHeaders = {};

class Mock {
    constructor(config) {
        this._id = config.id;

        this._protocol = config.protocol || '';
        this._host = config.host || '';
        this._path = config.path || '';
        this._method = config.method || '';
        this._user = config.user || '';
        this._password = config.password || '';
        this._filter = config.filter || (() => true);

        this._response = {};

        Object.keys(config.response).forEach(name => {
            let c = config.response[name];

            if (typeof c === 'function') {
                this._response[name] = c;
                return;
            }

            let body = c.body;
            if (body && isPlainObject(body) || Array.isArray(body)) body = JSON.stringify(body);
            let response = body;

            let type = '';

            if (c.type === 'xml' || c.type === 'html') {
                type = c.type;
                throw new Error('XML type not implemented.');
            } else if (type === 'text') type = 'text';

            this._response[name] = {
                status: c.hasOwnProperty('status') ? c.status : 200,
                headers: Object.assign({}, DefaultHeaders, c.headers || {}),
                responseType: type,
                response: response,
                responseText: response,
                responseXML: null,
                size: c.size || 0,
                timeout: c.timeout,
                error: c.error
            }
        });
    }

    is(method, url, user, password) {
        let parsed = parseURL(url);

        let protocol = parsed.protocol.substr(0, parsed.protocol.length - 1);
        let host = parsed.host;
        let path = parsed.pathname;

        if (this._protocol) {
            if (typeof this._protocol === 'string') {
                if (this._protocol.toLowerCase() !== protocol.toLowerCase()) return false;
            }
            else if (!protocol.match(this._protocol)) return false;
        }

        if (this._host) {
            if (typeof this._host === 'string') {
                if (this._host.toLowerCase() !== host.toLowerCase()) return false;
            }
            else if (!host.match(this._host)) return false;
        }

        if (this._path) {
            if (typeof this._path === 'string') {
                if (this._path.toLowerCase() !== path.toLowerCase()) return false;
            }
            else if (!path.match(this._path)) return false;
        }

        if (this._method) {
            if (typeof this._method === 'string') {
                if (this._method.toLowerCase() !== method.toLowerCase()) return false;
            }
            else if (!method.match(this._method)) return false;
        }

        if (this._user) {
            if (typeof this._user === 'string') {
                if (this._user.toLowerCase() !== user.toLowerCase()) return false;
            }
            else if (!user.match(this._user)) return false;
        }

        if (this._password) {
            if (typeof this._password === 'string') {
                if (this._password.toLowerCase() !== password.toLowerCase()) return false;
            }
            else if (!password.match(this._password)) return false;
        }

        return true;
    }

    has(name) {
        return !!this._response[name];
    }

    validateRequest(method, url, headers, body) {
        return this._filter({method, url, headers, body});
    }

    getResponse(name, method, url, user, password, headers, body) {
        if (!this._response[name]) return null;

        if (typeof this._response[name] === 'function') {
            let c = this._response[name]({method, url, user, password, headers, body});

            let body = c.body;
            if (body && isPlainObject(body) || Array.isArray(body)) body = JSON.stringify(body);
            let response = body;
            let type = '';

            if (c.type === 'xml' || c.type === 'html') {
                type = c.type;
                throw new Error('XML type not implemented.');
            } else if (type === 'text') type = 'text';

            return {
                status: c.hasOwnProperty('status') ? c.status : 200,
                headers: Object.assign({}, DefaultHeaders, c.headers || {}),
                responseType: type,
                response: response,
                responseText: response,
                responseXML: null,
                size: c.size || 0,
                timeout: c.timeout,
                error: c.error
            }
        }

        return this._response[name] || null;
    }
}

function parseURL(url) {
    let parser = document.createElement('a');
    parser.href = url;

    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        hash: parser.hash
    };
}

module.exports = Mock;