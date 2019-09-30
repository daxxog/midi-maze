var handleMouse = function(id) {
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');
    var mh = {
        mouse: {
            x: 0,
            y: 0
        }
    };

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);

        canvas.dataset.mouseX = mousePos.x;
        canvas.dataset.mouseY = mousePos.y;
        mh.mouse = mousePos;
    }, false);

    return mh;
};