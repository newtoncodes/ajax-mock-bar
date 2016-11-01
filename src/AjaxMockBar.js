'use strict';

const Draggable = require('./Draggable');
const DatGUI = require('./DatGUI');
const Decorator = require('./Decorator');
const Mock = require('./Mock');

let id = 1;
let getId = () => id ++;

let style = false;

class AjaxMockBar {
    constructor(mocks, autoStart, width) {
        if (!style) {
            require('../src/Styles.less');
            style = true;
        }

        let gui = this._gui = new DatGUI.GUI({
            scrollable: true,
            autoPlace: false,
            resizable: false,
            hideable: true,
            width: width || 200
        });

        this._mocks = [];
        this._mocksMenu = {};

        gui.useLocalStorage = true;
        gui.remember(this._mocksMenu);

        if (localStorage.getItem('__ajax_mock_bar_closed') == '1') gui.close();

        let onResize = gui.onResize;
        gui.onResize = function () {
            onResize.apply(this, arguments);

            if (gui.closed) localStorage.setItem('__ajax_mock_bar_closed', '1');
            else localStorage.setItem('__ajax_mock_bar_closed', '');
        };


        Object.keys(mocks).forEach(category => {
            let folder = gui.addFolder(category);

            mocks[category].forEach((mock) => {
                let name = mock.name || (mock.path || /^\//).toString()
                        .replace(/^\/\^?/, '')
                        .replace(/\$?\/$/, '')
                        .replace(/\\\//g, '/');

                let options = ['---'].concat(Object.keys(mock.response));

                mock.id = getId();

                this._mocksMenu[mock.id] = this._mocksMenu[mock.id] || '---';

                folder
                    .add(this._mocksMenu, mock.id, options)
                    .name(name)
                    .onChange(() => this._update());
            });
        });

        this._container = document.createElement('DIV');
        this._container.setAttribute('id', 'ajax-mock-bar');
        this._container.innerHTML = '<span>drag me</span>';
        this._container.appendChild(this._gui.domElement);

        this._started = false;

        Object.keys(mocks).forEach(category => {
            mocks[category].forEach(mock => this._mocks.push(new Mock(mock)));
        });

        if (autoStart) this.start();

        this._container.style.left = (localStorage.getItem('__ajax_mock_bar_left') || 20) + 'px';
        this._container.style.top = (localStorage.getItem('__ajax_mock_bar_top') || 20) + 'px';

        Draggable(this._container, {
            onStop: function (event, element) {
                let x = parseInt(element.style.left.trim());
                let y = parseInt(element.style.top.trim());

                localStorage.setItem('__ajax_mock_bar_left', x.toString());
                localStorage.setItem('__ajax_mock_bar_top', y.toString());
            }
        });
    }

    start() {
        if (!window) throw new Error('Wrong environment.');
        if (window['_____AJAX_MOCK_BAR_____']) throw new Error('Only one ajax mock bar can be started at a time.');
        if (this._started) return;

        window['_____AJAX_MOCK_BAR_____'] = true;
        this._started = true;

        Decorator.start(this);
    }

    stop() {
        if (!window) throw new Error('Wrong environment.');
        if (!this._started) return;

        Decorator.stop();

        window['_____AJAX_MOCK_BAR_____'] = false;
        this._started = false;
    }

    get container() {
        return this._container;
    }

    _update() {
        //if (!this._started) return;
        //
    }

    getMock(method, url, user, password) {
        let result = null;

        this._mocks.every(mock => {
            if (!mock.is(method, url, user, password)) return true;
            result = mock;
            return false;
        });

        if (result) {
            let mock = result;
            let chosen = this._mocksMenu[mock._id];

            if (!mock.has(chosen)) result = null;
            else result = {
                validate: mock.validateRequest.bind(mock),
                get: mock.getResponse.bind(mock, chosen)
            }
        }

        return result;
    }
}


module.exports = AjaxMockBar;