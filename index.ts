(() => {
	 type Point = { x: number, y: number };
	 type Player = { pos: Point, dir: number };
	 const B_WIDTH: number = 200;
	 const B_HEIGHT: number = 200;
	 const B_ROWS: number = 10;
	 const B_COLS: number = 10;
	 const NEAR_PLANE: number = 1;
	 const FOV: number = Math.PI * 0.5;
	 const SCENE: any[][] = [
	 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	 	[0, 0, "red", "blue", "green", "orange", "purple", "pink", "silver", 0],
	 	[0, 0, "yellow", 0, 0, 0, 0, 0, "lightgreen", 0],
	 	[0, 0, "blue", 0, 0, 0, 0, 0, "skyblue", 0],
	 	[0, 0, "yellow", 0, 0, "red", 0, 0, 0, 0],
	 	[0, 0, "grey", 0, 0, 0, 0, 0, 0, 0],
	 	[0, 0, "cyan", 0, 0, 0, 0, 0, 0, 0],
	 	[0, 0, "gold", "magenta", "blue", 0, 0, 0, 0, 0],
	 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	 ];
	 const P_WIDTH: number = 500;
	 const [S_WIDTH, S_HEIGHT] = getScreenSize();
	 const PLAYER_STEP_LEN: number = 0.5;
   const player: Player = { 
    pos: {x: B_COLS * 0.9, y: B_ROWS * 0.9},
    dir: Math.PI * 1.5,
   };
	
   function getScreenSize() {
		 const app = document.getElementById("app");
		 return [app.offsetWidth, app.offsetHeight];
	 }

 	 function intDiv(a: number, b: number): number {
		return Math.floor(a / b);
	 }		

	 function add(p1: Point, p2: Point): Point {
		 return { x: p1.x + p2.x, y: p1.y + p2.y };
	 }

	 function sub(p1: Point, p2: Point): Point {
		 return { x: p1.x - p2.x, y: p1.y - p2.y };
	 }

	 function scale(p: Point, s: number): Point {
		 return { x: p.x * s, y: p.y * s };
	 }

	 function hvProjections(t: number): Point {
		 return { x: Math.cos(t), y: Math.sin(t) };
	 }
	
 	 function vLength(p: Point): number {
		 return Math.sqrt(p.x * p.x + p.y * p.y);
	 }

 	 function normalize(p: Point): Point {
		 const len: number = vLength(p);
		 if (len === 0) 
			 return { x: 0, y: 0 };
		 return { x: p.x / len, y : p.x / len };
	 }

	 function rotate(p: Point, t: number): Point {
		 return { 
			x: p.x * Math.cos(t) - p.y * Math.sin(t),
			y: p.x * Math.sin(t) + p.y * Math.cos(t)
		 };
	 }

	 function drawLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string)
	 {
		 ctx.beginPath();
		 ctx.moveTo(p1.x, p1.y);
		 ctx.lineTo(p2.x, p2.y);
		 ctx.strokeStyle = color;
		 ctx.stroke();
	 }

	 function drawPoint(ctx: CanvasRenderingContext2D, p: Point, radius: number, color: string) 
	 {
		 ctx.beginPath();
		 ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
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
	
 	 function lerp(p1: Point, p2: Point, s: number): Point {
		 return add(p1, scale(sub(p2, p1), s));
	 }

	 function drawScreen(sCtx: CanvasRenderingContext2D, ctx, player: Player, p1: Point, p2: Point) {
		 sCtx.reset();
		 sCtx.fillStyle = "#000000";
		 sCtx.fillRect(0, 0, S_WIDTH, S_HEIGHT);
		 for (let x = 0; x < P_WIDTH; x++) {
			 const p: Point = lerp(p1, p2, x / P_WIDTH); 
			 let pa = player.pos,
				 pb = p,
				 cell = { x: 0, y: 0},
				 pc = null;
			 for(;;) {
			     cell = getCellFromPoints(pa, pb);
			     if (isCellOutOfBoard(cell) || SCENE[cell.y][cell.x]) break;
			 	 const pc: Point =  nextPoint(pa, pb);    
			     if (pc === null) break;
			     pa = pb;
			     pb = pc;
			 }
			 if (pb === null || isCellOutOfBoard(cell) || SCENE[cell.y][cell.x] === 0) continue;
			 drawPoint(ctx, pb, 0.08, "#000000");
			 const rayV: Point = sub(pb, player.pos);
			 const dirV: Point = hvProjections(player.dir);
			 const dotProduct: number = rayV.x * dirV.x + rayV.y * dirV.y;
			 const wallHeight: number = S_HEIGHT / dotProduct * NEAR_PLANE;
			 const wallWidth: number = Math.ceil(S_WIDTH / P_WIDTH);
			 sCtx.fillStyle = SCENE[cell.y][cell.x];
			 sCtx.fillRect(x * wallWidth, 0.5 * (S_HEIGHT - wallHeight), wallWidth, wallHeight);
		 }
	 }

	 function drawSceneMap(screenCtx: CanvasRenderingContext2D, ctx: CanvasRenderingContext2D, player: Player) {
		 const len: number = Math.tan(FOV * 0.5) * NEAR_PLANE;
		 const np: Point = add(player.pos, scale(hvProjections(player.dir), len));
		 const dVec: Point = sub(np, player.pos);
		 const npl: Point = sub(np, rotate(dVec, Math.PI * 0.5));
		 const npr: Point = add(np, rotate(dVec, Math.PI * 0.5));

		 drawScreen(screenCtx, ctx, player, npl, npr);

		 ctx.reset();
		 ctx.fillStyle = "#ffffff";
		 ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);
		 ctx.lineWidth = 0.02;
		 ctx.scale(B_WIDTH / B_COLS, B_HEIGHT / B_ROWS);
		 for (let r = 0; r <= B_ROWS; r++) {
			 drawLine(ctx, {x: r, y: 0}, {x: r, y: B_COLS}, "#000000");
		 }
		 for (let c = 0; c <= B_COLS; c++) {
			 drawLine(ctx, {x: 0, y: c}, {x: B_ROWS, y: c}, "#000000");
		 }
		 for (let r = 0; r < B_ROWS; r++) {
			 for (let c = 0; c < B_COLS; c++) {
				 if (!SCENE[r][c]) continue;
				 ctx.fillStyle = SCENE[r][c];
				 ctx.fillRect(c, r, 1, 1);
			 }
		 }
		 drawPoint(ctx, player.pos, 0.2, "#ff0000");
		 drawLine(ctx, np, npl, "#ff0000");
		 drawLine(ctx, np, npr, "#ff0000");
		 drawLine(ctx, player.pos, npl, "#ff0000");
		 drawLine(ctx, player.pos, npr, "#ff0000");
     
     updatePlayer();
	 }

   const screen = document.getElementById("screen") as HTMLCanvasElement | null;
   if (screen === null) 
       throw new Error("Failed to create screen.");
   const screenCtx = screen.getContext("2d") as CanvasRenderingContext2D | null;
   if (screenCtx === null) 
       throw new Error("Browser doesn't support 2D context");
   screen.width = S_WIDTH;
   screen.height = S_HEIGHT;

   const sceneMap = document.getElementById("scene-map") as HTMLCanvasElement | null;
   if (sceneMap === null) 
     throw new Error("Failed to create scene map.");
   const ctx = sceneMap.getContext("2d") as CanvasRenderingContext2D | null;
   if (ctx === null) 
     throw new Error("Browser doesn't support 2D context");
   ctx.fillStyle = "#ffffff";
   ctx.fillRect(0, 0, B_WIDTH, B_HEIGHT);
   sceneMap.width = B_WIDTH;
   sceneMap.height = B_HEIGHT;
  
   const handleKeyDown = (evt: KeyboardEvent) => {
     switch (evt.key) {
       case 'j':
	   case 'ArrowUp': {
               player.pos = add(player.pos, scale(hvProjections(player.dir), PLAYER_STEP_LEN));
               break;
             }
       case 'k':
	   case 'ArrowDown': {
               player.pos = add(player.pos, scale(hvProjections(player.dir), -1 * PLAYER_STEP_LEN));
               break;
             }
       case 'h': 
	   case 'ArrowLeft': {
               player.dir -= Math.PI * 0.1;
               break;
             }
       case 'l':
	   case 'ArrowRight': {
               player.dir += Math.PI * 0.1;
               break;
             }
     }
     drawSceneMap(screenCtx, ctx, player);
   };

   setupEvents();
   drawSceneMap(screenCtx, ctx, player);
   
   function setupEvents() {
     const dialog: HTMLElement = document.getElementById("scene-map-dialog");
     const colorInputsContainer: HTMLElement = document.getElementById("scene-map-dialog-color-inputs");
     const updateSceneMapBtn: HTMLElement = document.getElementById("update-scene-map-btn");
     const updateBtn: HTMLElement = document.getElementById("scene-map-dialog-update-btn");
     updateSceneMapBtn.addEventListener("click", openSceneMapDialog);
     updateBtn.addEventListener("click", updateSceneMap);
     
     function updateSceneMap() {
       for (let r = 0; r < B_ROWS; r++) {
         for (let c = 0; c < B_COLS; c++) {
           const colorInput: HTMLInputElement = document.getElementById(`color-input-${r}-${c}`);
           SCENE[r][c] = colorInput.value === "#ffffff" ? 0 : colorInput.value;;
         }
       }
       closeSceneMapDialog();
     }

     function closeSceneMapDialog() {
       colorInputsContainer.innerHTML = "";
       dialog.style.display = "none";
       drawSceneMap(screenCtx, ctx, player);
     }

     function openSceneMapDialog() {
       for (let r = 0; r < B_ROWS; r++) {
         const row: HTMLDivElement = document.createElement("div");
         row.style.display = "flex";
         for (let c = 0; c < B_COLS; c++) {
           const cellInput: HTMLInputElement = document.createElement("input");
           cellInput.setAttribute("type", "color");
           cellInput.setAttribute("value", "#ffffff");
           cellInput.setAttribute("id", `color-input-${r}-${c}`);
           cellInput.style.width = "40px";
           cellInput.style.height = "40px";
           cellInput.style.border = "none";
           row.appendChild(cellInput);
         }
         colorInputsContainer.appendChild(row);
       }
        
       dialog.style.display = "flex";
     }

     window.addEventListener("keydown", handleKeyDown);
     window.onclick = (evt: Event) => {
       if (evt.target == dialog) closeSceneMapDialog();
     }
   }
  

   function updatePlayer() {
     const playerPositionXElem: HTMLElement = document.getElementById("player-position-x");
     const playerPositionYElem: HTMLElement = document.getElementById("player-position-y");
     const playerDirectionElem: HTMLElement = document.getElementById("player-direction");
     playerPositionXElem.innerHTML = player.pos.x.toFixed(2);
     playerPositionYElem.innerHTML = player.pos.y.toFixed(2);
     playerDirectionElem.innerHTML = `${((player.dir * 180 / Math.PI) % 360).toFixed(2)} deg`;
   }
})();
