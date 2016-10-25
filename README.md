# ajax-mock-bar

AJAX/XHR mock bar - change mockups runtime.

## Installation

`npm install --save ajax-mock-bar`

The UMD build is in the dist directory.

## Description

This is a debug menu for choosing between mocks runtime.

![Debug menu screenshot](http://i.imgur.com/QBkN5qe.png)

It's intended to fully mock the XMLHTTPRequest class in browsers. You can use any ajax function/lib/framework for your project. Just write your config for XHR mocks and switch them while testing.

**You don't need a server to write the client.**

#### Configuration

```typescript
let config = {
    folder1: [
        {
            // All of the following are optional:
            
            name: 'Test', // Uses the path for default name
            host: /.*/, // Also accept strings for explicit check
            path: /^\/test$/, // Also accept strings for explicit check
            filter: ({method, url, headers, body}) => true,
            

            response: {
                default: {
                    // All props are optional
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
    ],
    
    folder2: [
        // ...
    ]
};
```

```typescript
const AjaxMockBar = require('ajax-mock-bar');

let bar = new AjaxMockBar(config);
document.body.appendChild(bar.container);
// or attach it where ever you want, it's fixed position

bar.start();
```
