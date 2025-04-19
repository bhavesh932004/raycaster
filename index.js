(function () {
    var B_WIDTH = 500;
    var B_HEIGHT = 500;
    var B_ROWS = 10;
    var B_COLS = 10;
    var SCENE = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    function drawLine(ctx, p1, p2, color) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    function drawPoint(ctx, p, r, color) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
    function snap(x, dx) {
        if (dx > 0)
            return Math.ceil(x + 0.000001);
        if (dx < 0)
            return Math.floor(x - 0.000001);
        return x;
    }
    function distance(p1, p2) {
        var dx = p2.x - p1.x, dy = p2.y - p1.y;
        return dx * dx + dy * dy;
    }
    function nextPoint(p1, p2) {
        var np = null;
        if (distance(p1, p2) === 0)
            return np;
        var dx = p2.x - p1.x, dy = p2.y - p1.y;
        var m = dy / dx;
        var c = p2.y - m * p2.x;
        if (dx === 0) {
            np = { x: p2.x, y: snap(p2.y, dy) };
        }
        else {
            var x = snap(p2.x, dx);
            var y = m * x + c;
            np = { x: x, y: y };
            if (m !== 0) {
                var y_1 = snap(p2.y, dy);
                var x_1 = (y_1 - c) / m;
                if (distance(p2, { x: x_1, y: y_1 }) < distance(p2, np))
                    np = { x: x_1, y: y_1 };
            }
        }
        return np;
    }
    function isCellOutOfBoard(p) {
        return p.x < 0 || p.x >= B_COLS || p.y < 0 || p.y >= B_ROWS;
    }
    function getCellFromPoints(p1, p2) {
        var dx = p2.x - p1.x, dy = p2.y - p1.y;
        return {
            x: Math.floor(p2.x + (0.000001 * (dx >= 0 ? 1 : -1))),
            y: Math.floor(p2.y + (0.000001 * (dy >= 0 ? 1 : -1)))
        };
    }
    function drawBoard(ctx, p2) {
        ctx.reset();
        ctx.lineWidth = 0.02;
        ctx.scale(B_WIDTH / B_COLS, B_HEIGHT / B_ROWS);
        for (var r = 0; r <= B_ROWS; r++) {
            drawLine(ctx, { x: r, y: 0 }, { x: r, y: B_COLS }, "#000000");
        }
        for (var c = 0; c <= B_COLS; c++) {
            drawLine(ctx, { x: 0, y: c }, { x: B_ROWS, y: c }, "#000000");
        }
        var p1 = { x: B_COLS * 0.31, y: B_ROWS * 0.43 };
        drawPoint(ctx, p1, 0.2, "#ff0000");
        if (p2 == undefined)
            return;
        for (;;) {
            drawPoint(ctx, p2, 0.08, "#ff0000");
            drawLine(ctx, p1, p2, "#ff0000");
            var cell = getCellFromPoints(p1, p2);
            if (isCellOutOfBoard(cell))
                break;
            var p3 = nextPoint(p1, p2);
            if (p3 === null)
                break;
            p1 = p2;
            p2 = p3;
        }
    }
    function init() {
        var canvas = document.getElementById("ray-caster");
        var ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Initialization failed");
        }
        canvas.width = B_WIDTH;
        canvas.height = B_HEIGHT;
        var handleMouseMove = function (evt) {
            var p2 = { x: evt.offsetX / B_WIDTH * B_COLS, y: evt.offsetY / B_HEIGHT * B_ROWS };
            drawBoard(ctx, p2);
        };
        canvas.addEventListener("mousemove", handleMouseMove);
        drawBoard(ctx, undefined);
    }
    init();
})();
