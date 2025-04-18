(function () {
    var B_WIDTH = 500;
    var B_HEIGHT = 500;
    var SF = 50;
    function drawLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    function init() {
        var canvas = document.getElementById("ray-caster");
        var ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Initialization failed");
        }
        canvas.width = B_WIDTH;
        canvas.height = B_HEIGHT;
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);
        ctx.strokeStyle = "rgb(255, 255, 255)";
        for (var r = 0; r <= B_HEIGHT; r += SF) {
            drawLine(r, 0, r, B_WIDTH);
        }
        for (var c = 0; c <= B_WIDTH; c += SF) {
            drawLine(0, c, B_HEIGHT, c);
        }
    }
})();
