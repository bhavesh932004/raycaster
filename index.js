(function () {
    var B_WIDTH = 200;
    var B_HEIGHT = 200;
    var B_ROWS = 10;
    var B_COLS = 10;
    var NEAR_PLANE = 1;
    var FOV = Math.PI * 0.5;
    var SCENE = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, "red", "blue", "green", "orange", 0, 0, 0],
        [0, 0, 0, "yellow", 0, 0, 0, "purple", 0, 0],
        [0, 0, 0, "blue", 0, 0, 0, 0, 0, 0],
        [0, 0, 0, "yellow", "magenta", "blue", 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    var P_WIDTH = 300;
    var _a = getScreenSize(), S_WIDTH = _a[0], S_HEIGHT = _a[1];
    var PLAYER_STEP_LEN = 0.5;
    function getScreenSize() {
        var app = document.getElementById("app");
        return [app.offsetWidth, app.offsetHeight];
    }
    function intDiv(a, b) {
        return Math.floor(a / b);
    }
    function add(p1, p2) {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    }
    function sub(p1, p2) {
        return { x: p1.x - p2.x, y: p1.y - p2.y };
    }
    function scale(p, s) {
        return { x: p.x * s, y: p.y * s };
    }
    function hvProjections(t) {
        return { x: Math.cos(t), y: Math.sin(t) };
    }
    function vLength(p) {
        return Math.sqrt(p.x * p.x + p.y * p.y);
    }
    function normalize(p) {
        var len = vLength(p);
        if (len === 0)
            return { x: 0, y: 0 };
        return { x: p.x / len, y: p.x / len };
    }
    function rotate(p, t) {
        return {
            x: p.x * Math.cos(t) - p.y * Math.sin(t),
            y: p.x * Math.sin(t) + p.y * Math.cos(t)
        };
    }
    function drawLine(ctx, p1, p2, color) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    function drawPoint(ctx, p, radius, color) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
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
    function lerp(p1, p2, s) {
        return add(p1, scale(sub(p2, p1), s));
    }
    function drawScreen(sCtx, ctx, player, p1, p2) {
        sCtx.reset();
        sCtx.fillStyle = "#000000";
        sCtx.fillRect(0, 0, S_WIDTH, S_HEIGHT);
        for (var x = 0; x < P_WIDTH; x++) {
            var p = lerp(p1, p2, x / P_WIDTH);
            var pa = player.pos, pb = p, cell = { x: 0, y: 0 }, pc = null;
            for (;;) {
                cell = getCellFromPoints(pa, pb);
                if (isCellOutOfBoard(cell) || SCENE[cell.y][cell.x])
                    break;
                var pc_1 = nextPoint(pa, pb);
                if (pc_1 === null)
                    break;
                pa = pb;
                pb = pc_1;
            }
            if (pb === null || isCellOutOfBoard(cell) || SCENE[cell.y][cell.x] === 0)
                continue;
            drawPoint(ctx, pb, 0.08, "#000000");
            var rayV = sub(pb, player.pos);
            var dirV = hvProjections(player.dir);
            var dotProduct = rayV.x * dirV.x + rayV.y * dirV.y;
            var wallHeight = S_HEIGHT / dotProduct * NEAR_PLANE;
            var wallWidth = Math.ceil(S_WIDTH / P_WIDTH);
            sCtx.fillStyle = SCENE[cell.y][cell.x];
            sCtx.fillRect(x * wallWidth, 0.5 * (S_HEIGHT - wallHeight), wallWidth, wallHeight);
        }
    }
    function drawSceneMap(screenCtx, ctx, player) {
        var len = Math.tan(FOV * 0.5) * NEAR_PLANE;
        var np = add(player.pos, scale(hvProjections(player.dir), len));
        var dVec = sub(np, player.pos);
        var npl = sub(np, rotate(dVec, Math.PI * 0.5));
        var npr = add(np, rotate(dVec, Math.PI * 0.5));
        drawScreen(screenCtx, ctx, player, npl, npr);
        ctx.reset();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);
        ctx.lineWidth = 0.02;
        ctx.scale(B_WIDTH / B_COLS, B_HEIGHT / B_ROWS);
        for (var r = 0; r <= B_ROWS; r++) {
            drawLine(ctx, { x: r, y: 0 }, { x: r, y: B_COLS }, "#000000");
        }
        for (var c = 0; c <= B_COLS; c++) {
            drawLine(ctx, { x: 0, y: c }, { x: B_ROWS, y: c }, "#000000");
        }
        for (var r = 0; r < B_ROWS; r++) {
            for (var c = 0; c < B_COLS; c++) {
                if (!SCENE[r][c])
                    continue;
                ctx.fillStyle = SCENE[r][c];
                ctx.fillRect(c, r, 1, 1);
            }
        }
        drawPoint(ctx, player.pos, 0.2, "#ff0000");
        drawLine(ctx, np, npl, "#ff0000");
        drawLine(ctx, np, npr, "#ff0000");
        drawLine(ctx, player.pos, npl, "#ff0000");
        drawLine(ctx, player.pos, npr, "#ff0000");
    }
    function init() {
        var screen = document.getElementById("screen");
        if (screen === null)
            throw new Error("Failed to create screen.");
        var screenCtx = screen.getContext("2d");
        if (screenCtx === null)
            throw new Error("Browser doesn't support 2D context");
        screen.width = S_WIDTH;
        screen.height = S_HEIGHT;
        var sceneMap = document.getElementById("scene-map");
        if (sceneMap === null)
            throw new Error("Failed to create scene map.");
        var ctx = sceneMap.getContext("2d");
        if (ctx === null)
            throw new Error("Browser doesn't support 2D context");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);
        sceneMap.width = B_WIDTH;
        sceneMap.height = B_HEIGHT;
        var player = {
            pos: { x: B_COLS * 0.95, y: B_ROWS * 0.95 },
            dir: Math.PI * 1.25,
        };
        var handleKeyDown = function (evt) {
            if (evt.repeat)
                return;
            switch (evt.key) {
                case 'j': {
                    player.pos = add(player.pos, scale(hvProjections(player.dir), PLAYER_STEP_LEN));
                    break;
                }
                case 'k': {
                    player.pos = add(player.pos, scale(hvProjections(player.dir), -1 * PLAYER_STEP_LEN));
                    break;
                }
                case 'h': {
                    player.dir -= Math.PI * 0.1;
                    break;
                }
                case 'l': {
                    player.dir += Math.PI * 0.1;
                    break;
                }
            }
            drawSceneMap(screenCtx, ctx, player);
        };
        window.addEventListener("keydown", handleKeyDown);
        drawSceneMap(screenCtx, ctx, player);
    }
    init();
})();
