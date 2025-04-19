(() => {
	 const B_WIDTH: number = 500;
	 const B_HEIGHT: number = 500;
	 const B_ROWS: number = 10;
	 const B_COLS: number = 10;
	 const SCENE: number[][] = [
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

	 type Point = { x: number, y: number };

	 function drawLine(ctx, p1: Point, p2: Point, color: string)
	 {
		 ctx.beginPath();
		 ctx.moveTo(p1.x, p1.y);
		 ctx.lineTo(p2.x, p2.y);
		 ctx.strokeStyle = color;
		 ctx.stroke();
	 }

	 function drawPoint(ctx, p, r, color) 
	 {
		 ctx.beginPath();
		 ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
		 ctx.fillStyle = color;
		 ctx.fill();
	 }

	 function snap(x: number, dx: number): number {
		 if (dx > 0) return Math.ceil(x + 0.000001);
		 if (dx < 0) return Math.floor(x - 0.000001);
		 return x;
	 }
	
 	 function distance(p1: Point, p2: Point): number {
		 const dx = p2.x - p1.x,
			   dy = p2.y - p1.y;
		 return dx * dx + dy * dy;
	 }

	 function nextPoint(p1: Point, p2: Point): Point {
		 let np: Point | null = null;
		 if (distance(p1, p2) === 0) return np;

		 const dx = p2.x - p1.x,
			   dy = p2.y - p1.y;
		 const m = dy / dx;
		 const c = p2.y - m * p2.x; 
		 if (dx === 0) {
			 np = {x: p2.x, y: snap(p2.y, dy)};
		 } else {
			 const x = snap(p2.x, dx);
			 const y = m * x + c; 
			 np = {x, y};
			 if (m !== 0) {
				 const y = snap(p2.y, dy);
				 const x = (y - c) / m;
				 if (distance(p2, {x, y}) < distance(p2, np)) 
					 np = {x, y};
			 } 
		 } 
		 
		 return np;
	 }
	
	 function isCellOutOfBoard(p: Point): boolean {
		 return p.x < 0 || p.x >= B_COLS || p.y < 0 || p.y >= B_ROWS;
	 }
	
	 function getCellFromPoints(p1: Point, p2: Point): Point {
		 const dx = p2.x - p1.x,
			   dy = p2.y - p1.y;
		 return { 
			x: Math.floor(p2.x + (0.000001 * (dx >= 0 ? 1 : -1))),
			y: Math.floor(p2.y + (0.000001 * (dy >= 0 ? 1 : -1)))
		 }
	 }

	 function drawBoard(ctx, p2) {
		 ctx.reset();
		 ctx.lineWidth = 0.02;
		 ctx.scale(B_WIDTH / B_COLS, B_HEIGHT / B_ROWS);
		 for (let r = 0; r <= B_ROWS; r++) {
			 drawLine(ctx, {x: r, y: 0}, {x: r, y: B_COLS}, "#000000");
		 }
		 for (let c = 0; c <= B_COLS; c++) {
			 drawLine(ctx, {x: 0, y: c}, {x: B_ROWS, y: c}, "#000000");
		 }
		 let p1 = { x: B_COLS * 0.31, y: B_ROWS * 0.43};
		 drawPoint(ctx, p1, 0.2, "#ff0000");

		 if (p2 == undefined) return;
		 for(;;) {
		     drawPoint(ctx, p2, 0.08, "#ff0000");
		 	 drawLine(ctx, p1, p2, "#ff0000");
			 const cell: Point = getCellFromPoints(p1, p2);
			 if (isCellOutOfBoard(cell)) break;
		 	 const p3: Point =  nextPoint(p1, p2);    
			 if (p3 === null) break;
		     p1 = p2;
		     p2 = p3;
		 }
	 }

	 function init() {
		 const canvas = document.getElementById("ray-caster") as HTMLCanvasElement;
		 const ctx = canvas.getContext("2d");
		 if (!ctx) {
			 throw new Error("Initialization failed");
		 }

		 canvas.width = B_WIDTH;
		 canvas.height = B_HEIGHT;

		 const handleMouseMove = (evt: MouseEvent) => {
			 const p2 = {x: evt.offsetX / B_WIDTH * B_COLS, y: evt.offsetY / B_HEIGHT * B_ROWS};
			 drawBoard(ctx, p2);
		 }
		 canvas.addEventListener("mousemove", handleMouseMove);
		 drawBoard(ctx, undefined);
	 }

	 init();
})();
