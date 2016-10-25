'use strict';

module.exports = {
    folder1: [
        {
            //host: /.+/,
            name: 'Test',
            path: /test$/,
            filter: ({method, url, headers, body}) => true,

            response: {
                default: {
                    status: 200,
                    headers: {},
                    type: 'json',
                    body: {
                        foo: 'bar'
                    },
                    size: 1024
                },

                timeout: {
                    timeout: 2000,
                    error: 'timeout'
                },

                error: {
                    timeout: 1000,
                    error: 'error'
                },

                fn: ({method, url, headers, body}) => ({
                    status: 200,
                    headers: {},
                    type: 'json',
                    body: {
                        foo: 'bar'
                    },
                    size: 1024
                })
            }
        }
    ]
};