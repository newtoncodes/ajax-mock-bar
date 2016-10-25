'use strict';

const AjaxMockBar = require('../src');


class ExampleApp {
    constructor() {
        let bar = new AjaxMockBar(require('./mocks'));
        document.body.appendChild(bar.container);
        bar.start();
    }

    request(url, method = 'GET', data = null, async = undefined, user = undefined, password = undefined) {
        let a = new XMLHttpRequest;

        a.addEventListener('loadstart', (a) => console.log('loadstart', a));
        a.addEventListener('progress', (a) => console.log('progress', a));
        a.addEventListener('abort', (a) => console.log('abort', a));
        a.addEventListener('error', (a) => console.log('error', a));
        a.addEventListener('load', (a) => console.log('load', a));
        a.addEventListener('timeout', (a) => console.log('timeout', a));
        a.addEventListener('loadend', (e) => console.log('loadend', e, a));
        a.addEventListener('readystatechange', (a) => console.log('readystatechange', a));

        a.onreadystatechange = function() {
            console.log('Ready state change: ', a.readyState);
        };

        a.open(method, url, async, user, password);
        a.send(data);
    }
}


module.exports = ExampleApp;