(() => {
  const B_WIDTH: number = 500;
  const B_HEIGHT: number = 500;
  const SF: number = 50;

  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function init() {
    const canvas = document.getElementById("ray-caster") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Initialization failed");
    }

    canvas.width = B_WIDTH;
    canvas.height = B_HEIGHT;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);

    ctx.strokeStyle = "rgb(255, 255, 255)"; 
    for (let r = 0; r <= B_HEIGHT; r += SF) {
      drawLine(r, 0, r, B_WIDTH);
    }

    for (let c = 0; c <= B_WIDTH; c += SF) {
      drawLine(0, c, B_HEIGHT, c);
    }
  }
})();
