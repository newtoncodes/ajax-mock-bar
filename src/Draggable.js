'use strict';

function Draggable(elem, options) {
    options = Object(options);
    options.onStart = options.onStart || function () {};
    options.onStop = options.onStop || function () {};
    options.onDrag = options.onDrag || function () {};

    elem.style.position = "absolute";

    let draggable = {drag: false};

    let moveHandler = function (e) {
        if (!draggable.drag) return;
        if (options.onDrag.call(this, e, elem) === false) return;

        if (!options.onlyY) elem.style.left = draggable.elPos.x + e.clientX - draggable.mousePos.x + "px";
        if (!options.onlyX) elem.style.top = draggable.elPos.y + e.clientY - draggable.mousePos.y + "px";
    };

    let upHandler = function (e) {
        draggable.drag = false;

        window.removeEventListener('mouseup', upHandler);
        window.removeEventListener('mousemove', moveHandler);
        elem.addEventListener('mousedown', downHandler);

        document.body.className = document.body.className.replace(/ajax-mock-bar-disable-select/g, '').replace(/\s+/g, ' ').replace(/(\s+$|^\s+)/, '');

        options.onStop.call(this, e, elem);
    };

    let downHandler = function (e) {
        let tag = e.target.nodeName.toLowerCase();
        if (tag === 'select' || tag === 'input' || tag === 'textarea') return;

        draggable.drag = true;
        draggable.mousePos = {
            x: e.clientX,
            y: e.clientY
        };
        draggable.elPos = {
            x: elem.offsetLeft,
            y: elem.offsetTop
        };

        elem.removeEventListener('mousedown', downHandler);
        window.addEventListener('mouseup', upHandler);
        window.addEventListener('mousemove', moveHandler);

        document.body.className += ' ajax-mock-bar-disable-select';

        options.onStart.call(this, e, elem);
    };

    elem.addEventListener('mousedown', downHandler);
}


module.exports = Draggable;