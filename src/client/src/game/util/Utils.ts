export function drawText(ctx: CanvasRenderingContext2D, text: string,
						 anchor: CanvasTextBaseline, x: number, y: number, font: string): void {
	ctx.textAlign = "center";
	ctx.textBaseline = anchor;
	ctx.fillStyle = "rgba(255, 255, 255, 1)";
	ctx.font = font;
	ctx.fillText(text, x, y);
}