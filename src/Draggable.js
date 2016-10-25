'use strict';

function Draggable(elem, options) {
    options = Object(options);

    // Handlers
    options.onStart = options.onStart || function () {};
    options.onStop = options.onStop || function () {};
    options.onDrag = options.onDrag || function () {};

    // Query the elements
    var allElms = [elem];

    // Each element
    for (var i = 0; i < allElms.length; ++i) {
        (function (cEl) {

            // TODO
            // document.body.appendChild(cEl);
            cEl.style.position = "absolute";

            // create _simpleDraggable object for this dom element
            cEl._simpleDraggable = {
                drag: false
            };

            // listen for mousedown
            cEl.addEventListener("mousedown", function (e) {

                // set true for drag field
                cEl._simpleDraggable.drag = true;

                // set the mouse position on the page
                cEl._simpleDraggable.mousePos = {
                    x: e.clientX,
                    y: e.clientY
                };

                // set the element position
                cEl._simpleDraggable.elPos = {
                    x: cEl.offsetLeft,
                    y: cEl.offsetTop
                };

                // call start handler
                options.onStart.call(this, e, cEl);
            });

            // listen for mouse up
            cEl.addEventListener("mouseup", function (e) {

                // drag: false
                cEl._simpleDraggable.drag = false;

                // call stop handler
                options.onStop.call(this, e, cEl);
            });

            // listen for mouse out of body
            document.body.addEventListener("mouseout", function (e) {

                // drag: false
                cEl._simpleDraggable.drag = false;

                // call stop handler
                options.onStop.call(this, e, cEl);
            });

            // listen for mouse move
            document.body.addEventListener("mousemove", function (e) {

                // if drag is NOT true, return
                if (!cEl._simpleDraggable.drag) {
                    return;
                }

                // if drag handler returns false, don't do anything
                if (options.onDrag.call(this, e, cEl) === false) {
                    return;
                }

                // move only on y axis
                if (!options.onlyY) {
                    cEl.style.left = cEl._simpleDraggable.elPos.x + e.clientX - cEl._simpleDraggable.mousePos.x + "px";
                }

                // move only on x axis
                if (!options.onlyX) {
                    cEl.style.top = cEl._simpleDraggable.elPos.y + e.clientY - cEl._simpleDraggable.mousePos.y + "px";
                }
            });
        })(allElms[i]);
    }
}


module.exports = Draggable;