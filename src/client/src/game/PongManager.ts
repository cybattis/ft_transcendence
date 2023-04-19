export type AIDifficulty = "Easy" | "Medium" | "Hard";

export class Vec2 {
	public x: number;
	public y: number;

	constructor(x: number, y?: number) {
		this.x = x;
		this.y = y ?? x;
	}

	normalize() {
		const mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		this.x /= mag;
		this.y /= mag;
	}
}

export class Ball {
	public readonly pos: Vec2;
	public readonly vel: Vec2;
	public readonly radius: number;

	private canvasSize: Vec2;
	private speed: number;

	constructor(x: number, y: number, radius: number, canvasWidth: number, canvasHeight: number, speed: number, direction: number) {
		this.pos = new Vec2(x, y);
		this.radius = radius;
		this.canvasSize = new Vec2(canvasWidth, canvasHeight);
		this.speed = speed;

		this.vel = new Vec2(Math.cos(direction) * this.speed, Math.sin(direction) * this.speed);
	}

	setVelocity(newVelocity: Vec2) {
		this.vel.x = newVelocity.x;
		this.vel.y = newVelocity.y;
	}

	setPosition(newPosition: Vec2) {
		this.pos.x = newPosition.x;
		this.pos.y = newPosition.y;
	}

	goToCenter() {
		this.pos.x = this.canvasSize.x / 2;
		this.pos.y = this.canvasSize.y / 2;

		const direction = Math.random() * Math.PI * 2;
		this.vel.x = Math.cos(direction) * this.speed;
		this.vel.y = Math.sin(direction) * this.speed;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
	}

	update(frameTime: DOMHighResTimeStamp) {
		this.pos.x += this.vel.x * frameTime;
		this.pos.y += this.vel.y * frameTime;

		if (this.pos.y - this.radius <= 0) {
			this.pos.y += 2 * -(this.pos.y - this.radius);
			this.vel.y *= -1;
		}

		if (this.pos.y + this.radius >= this.canvasSize.y) {
			this.pos.y -= 2 * (this.pos.y + this.radius - this.canvasSize.y);
			this.vel.y *= -1;
		}
	}
}

export class Paddle {
	
}

export class AIOnlyPongState {
	public name: string;
	public canvas: HTMLCanvasElement;

	public leftDifficulty: AIDifficulty;
	public leftPosition: number;
	public rightDifficulty: AIDifficulty;
	public rightPosition: number;

	public ball: Ball;

	constructor(name: string, canvas: HTMLCanvasElement, leftDifficulty: AIDifficulty, rightDifficulty: AIDifficulty) {
		this.name = name;
		this.canvas = canvas;
		this.leftDifficulty = leftDifficulty;
		this.rightDifficulty = rightDifficulty;
		this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, this.canvas.width, this.canvas.height, 150, Math.PI / 4);
	}

	update(frameTime: DOMHighResTimeStamp) {
		this.ball.update(frameTime);
		if (this.ball.pos.x >= this.canvas.width || this.ball.pos.x <= 0) {
			this.ball.goToCenter();
		}

		const ballPos = this.ball.pos.y;
		this.leftPosition = ballPos;
		this.rightPosition = ballPos;
	}

	render() {
		if (!this.canvas) return;
		if (!this.canvas.getContext) return;

		const ctx = this.canvas.getContext("2d");
		if (!ctx) return;

		ctx.fillStyle = "rgba(0, 0, 0, 255)";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.fillStyle = "rgba(255, 255, 255, 255)";
		ctx.strokeStyle = "rgba(255, 255, 255, 255)";
		ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.beginPath();
		ctx.moveTo(this.canvas.width * 0.5, 0);
		ctx.lineTo(this.canvas.width * 0.5, this.canvas.height);
		ctx.stroke();
		ctx.closePath();

		this.ball.render(ctx);
		this.renderPaddles(ctx);
	}

	private renderPaddles(ctx: CanvasRenderingContext2D) {
		ctx.fillRect(this.canvas.width * 0.025,
			this.canvas.height * this.leftPosition - this.canvas.height * 0.1,
			this.canvas.width * 0.025,
			this.canvas.height * 0.2);

		ctx.fillRect(this.canvas.width * 0.95,
			this.canvas.height * this.rightPosition - this.canvas.height * 0.1,
			this.canvas.width * 0.025,
			this.canvas.height * 0.2);
	}
}

let lastFrameTimestamp: DOMHighResTimeStamp = 0;
let AIOnlyGameList: AIOnlyPongState[] = new Array<AIOnlyPongState>();

export function startPongManager() {
	lastFrameTimestamp = performance.now();
	window.requestAnimationFrame(updatePongGames);
}

export function updatePongGames(timestamp: DOMHighResTimeStamp) {
	AIOnlyGameList.forEach((game) => {
		game.update((timestamp - lastFrameTimestamp) / 1000.0);
		game.render();
	});
	lastFrameTimestamp = timestamp;
	window.requestAnimationFrame(updatePongGames);
}

export function createNewAIOnlyGame(newGame: AIOnlyPongState) {
	AIOnlyGameList.push(newGame);
	console.log("New game: ", newGame.name);
}

export function removeAiOnlyGame(name: string) {
	console.log("Try to remove game", name);
	let index = -1;

	for (let i = 0; i < AIOnlyGameList.length; i++) {
		console.log("Iterating over:", AIOnlyGameList[i].name);
		if (AIOnlyGameList[i].name === name) {
			index = i;
			break;
		}
	}

	if (index !== -1) {
		AIOnlyGameList.splice(index, 1);
		console.log("Removing game...", name);
	}
}