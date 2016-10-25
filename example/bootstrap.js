'use strict';

const ExampleApp = require('./ExampleApp');

window.app = new ExampleApp();
window.request = app.request.bind(app);