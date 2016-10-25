'use strict';

const async = require('async');

const STATE_UNSENT             = 0;
const STATE_OPENED             = 1;
const STATE_HEADERS_RECEIVED   = 2;
const STATE_LOADING            = 3;
const STATE_DONE               = 4;

const Original = {};

function start(manager) {
    Original.open = XMLHttpRequest.prototype.open;
    Original.setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    Original.send = XMLHttpRequest.prototype.send;
    Original.abort = XMLHttpRequest.prototype.abort;
    Original.getResponseHeader = XMLHttpRequest.prototype.getResponseHeader;
    Original.getAllResponseHeaders = XMLHttpRequest.prototype.getAllResponseHeaders;

    XMLHttpRequest.prototype.trigger = function (event) {
        // this.onreadystatechange && this.onreadystatechange();
        // this['on' + event] && this['on' + event]();

        if (document.createEvent) {
            let e = document.createEvent('Event');
            e.initEvent(event, true, false);
            this.dispatchEvent(e);
        } else this.fireEvent('on' + event);

        return this;
    };

    XMLHttpRequest.prototype.reopen = function () {
        this._mock = null;

        let requestHeaders = this._requestHeaders;
        this.reset();

        let result = Original.open.apply(this, [this.method, this.url, this.async, this.user, this.password]);

        Object.keys(requestHeaders).forEach(name => this.setRequestHeader(name, this._requestHeaders[name]));

        return result;
    };

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._mock = manager.getMock(method, url, user, password);

        if (!this._mock) return Original.open.apply(this, arguments);

        Object.defineProperties(this, {
            status: {writable: true},
            statusText: {writable: true},
            response: {writable: true},
            responseURL: {writable: true},
            responseType: {writable: true},
            responseText: {writable: true},
            responseXML: {writable: true},
            readyState: {writable: true}
        });

        this.reset();

        this.method   = method;
        this.url      = url;
        this.user     = user;
        this.password = password;

        this['async']  = async;

        this.readyState = STATE_OPENED;
        this.trigger('readystatechange');
    };

    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
        if (!this._mock) return Original.setRequestHeader.apply(this, arguments);

        this._requestHeaders[name] = value;
    };

    XMLHttpRequest.prototype.send = function (data) {
        if (!this._mock) return Original.send.apply(this, arguments);

        if (!this._mock.validate(this.method, this.url, this._requestHeaders, data)) {
            this.reopen();
            return Original.send.apply(this, arguments);
        }

        this.trigger('loadstart');

        let mock = this._mock.get(this.method, this.url, this.user, this.password, this._requestHeaders, data);

        let response = mock.response || '';
        let size = mock.size || (response ? response.length : 100);
        let error = mock.error;
        let timeout = mock.timeout || parseInt(Math.round(20 + Math.random() * 80));
        let responseHeaders = mock.headers;
        let responseStatus = mock.status;
        let responseType = mock.responseType;
        let responseText = mock.responseText;
        let responseXML = mock.responseXML;
        let responseURL = this.url;

        if (error) {
            this._sendTimeout = setTimeout(() => {
                this.readyState = STATE_DONE;
                this.trigger('readystatechange');

                this._sendTimeout = setTimeout(() => {
                    if (error === 'timeout') this.trigger('timeout', {loaded: 0, total: size});
                    else this.trigger('error', {loaded: 0, total: size});

                    this._sendTimeout = setTimeout(() => {
                        this.trigger('loadend', {loaded: 0, total: size});
                    }, 0);
                }, 0);
            }, timeout);

            return;
        }

        this._sendTimeout = setTimeout(() => {
            this.readyState = STATE_HEADERS_RECEIVED;
            this.trigger('readystatechange');

            this._sendTimeout = setTimeout(() => {
                this.readyState = STATE_LOADING;
                this.trigger('readystatechange');

                let slices = timeout < 60 ? 2 : (timeout < 100 ? 3 : (timeout < 160 ? 4 : 10));
                let interval = Math.floor(timeout / slices);
                let start = Date.now();
                let loaded = 0;

                async.whilst(
                    () => this._sendTimeout && (Date.now() - start < timeout),

                    (callback) => {
                        loaded = parseInt(Math.round(Math.min(size, loaded + size / slices)));

                        this._sendCallback = callback;
                        this._sendTimeout = setTimeout(() => {
                            this.trigger('progress', {loaded: loaded, total: size});
                            this._sendCallback = null;
                            callback();
                        }, Math.min(interval, timeout - (Date.now() - start)));
                    },

                    () => {
                        if (!this._sendTimeout) return;

                        this._sendTimeout = setTimeout(() => {
                            this.readyState         = STATE_DONE;

                            this.status             = responseStatus;
                            this.statusText         = responseStatus;
                            this.response           = response;
                            this.responseURL        = responseURL;
                            this.responseType       = responseType;
                            this.responseText       = responseText;
                            this.responseXML        = responseXML;

                            this._responseHeaders   = responseHeaders;

                            this.trigger('readystatechange');
                            this.trigger('load', {loaded: size, total: size});
                            this.trigger('loadend', {loaded: size, total: size});
                        }, 0)
                    }
                );
            }, 0);

        }, 0);

        this.readyState = STATE_LOADING;
    };

    XMLHttpRequest.prototype.abort = function () {
        if (!this._mock) return Original.abort.apply(this, arguments);

        clearTimeout(this._sendTimeout);
        this._sendTimeout = null;

        if (this._sendCallback) {
            this._sendCallback();
            this._sendCallback = null;
        }

        if (this.readyState > STATE_UNSENT && this.readyState < STATE_DONE) {
            this.readyState = STATE_UNSENT;
            this.trigger('abort');
        }
    };

    XMLHttpRequest.prototype.getResponseHeader = function (name) {
        if (!this._mock) return Original.getResponseHeader.apply(this, arguments);

        if (this.readyState < STATE_HEADERS_RECEIVED) return null;
        return this._responseHeaders[name.toLowerCase()] || null;
    };

    XMLHttpRequest.prototype.getAllResponseHeaders = function () {
        if (!this._mock) return Original.getAllResponseHeaders.apply(this, arguments);

        if (this.readyState < STATE_HEADERS_RECEIVED) return null;

        return Object.keys(this._responseHeaders)
            .map(name => name + ': ' + this._responseHeaders[name] + '\r\n')
            .join('');
    };

    XMLHttpRequest.prototype.reset = function () {
        try {
            this.status       = 0;
            this.statusText   = '';

            this.response     = null;
            this.responseURL  = null;
            this.responseType = null;
            this.responseText = null;
            this.responseXML  = null;
        } catch (e) {

        }

        this._requestHeaders  = {};
        this._responseHeaders = {};
    };
}

function stop() {
    XMLHttpRequest.prototype.open = Original.open;
    XMLHttpRequest.prototype.setRequestHeader = Original.setRequestHeader;
    XMLHttpRequest.prototype.send = Original.send;
    XMLHttpRequest.prototype.abort = Original.abort;
    XMLHttpRequest.prototype.getResponseHeader = Original.getResponseHeader;
    XMLHttpRequest.prototype.getAllResponseHeaders = Original.getAllResponseHeaders;
}


module.exports = {start, stop};