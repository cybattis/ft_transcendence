import {PongState} from "./PongState";
import {drawText} from "./Utils";

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

	private serving: boolean;
	private canvasSize: Vec2;
	private speed: number;
	private readonly baseSpeed: number;
	private readonly maxSpeed: number;
	private readonly servingSpeed: number;

	constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
		this.pos = new Vec2(x, y);

		const primarySize = Math.min(canvasWidth / 2, canvasHeight);
		this.radius = primarySize / 40;
		this.maxSpeed = primarySize / 40;
		this.speed = primarySize / 2;
		this.baseSpeed = primarySize / 2;
		this.servingSpeed = primarySize / 4;
		this.canvasSize = new Vec2(canvasWidth, canvasHeight);

		this.serving = true;
		this.vel = new Vec2(0, 0);

		if (Math.random() > 0.5)
			this.serveRight();
		else
			this.serveLeft();
	}

	setVelocity(newVelocity: Vec2) {
		this.vel.x = newVelocity.x;
		this.vel.y = newVelocity.y;
	}

	setPosition(newPosition: Vec2) {
		this.pos.x = newPosition.x;
		this.pos.y = newPosition.y;
	}

	serveRight() {
		this.goToCenter();
		const direction = Math.random() * Math.PI / 2 - Math.PI / 4;
		this.vel.x = Math.cos(direction) * this.servingSpeed;
		this.vel.y = -Math.sin(direction) * this.servingSpeed;
	}

	serveLeft() {
		this.goToCenter();
		const direction = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
		this.vel.x = Math.cos(direction) * this.servingSpeed;
		this.vel.y = -Math.sin(direction) * this.servingSpeed;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
	}

	update(frameTime: DOMHighResTimeStamp) {
		const clampedVel = new Vec2(this.vel.x, this.vel.y);
		if (Math.pow(clampedVel.x, 2) + Math.pow(clampedVel.y, 2) > Math.pow(this.maxSpeed * 400, 2)) {
			const mag = Math.sqrt(Math.pow(clampedVel.x, 2) + Math.pow(clampedVel.y, 2));
			const coef = this.maxSpeed * 400 / mag;
			clampedVel.x *= coef;
			clampedVel.y *= coef;
		}

		this.pos.x += clampedVel.x * frameTime;
		this.pos.y += clampedVel.y * frameTime;

		if (this.pos.y - this.radius <= 0) {
			this.pos.y += 2 * -(this.pos.y - this.radius);
			this.vel.y *= -1;
		}

		if (this.pos.y + this.radius >= this.canvasSize.y) {
			this.pos.y -= 2 * (this.pos.y + this.radius - this.canvasSize.y);
			this.vel.y *= -1;
		}
	}

	checkCollision(paddle: Paddle) {
		const pBounds = {
			top: paddle.pos.y,
			bottom: paddle.pos.y + paddle.size.y,
			left: paddle.pos.x,
			right: paddle.pos.x + paddle.size.x
		}

		const bBounds = {
			top: this.pos.y - this.radius,
			bottom: this.pos.y + this.radius,
			left: this.pos.x - this.radius,
			right: this.pos.x + this.radius
		}

		if (bBounds.bottom >= pBounds.top && bBounds.top <= pBounds.bottom &&
			bBounds.left <= pBounds.right && bBounds.right >= pBounds.left) {
			if (this.pos.x > this.canvasSize.x / 2) {
				const offset = pBounds.left - bBounds.right;
				this.pos.x += 2 * offset;
			} else {
				const offset = pBounds.right - bBounds.left;
				this.pos.x += 2 * offset;
			}

			if (this.serving) {
				this.vel.x *= this.baseSpeed / this.servingSpeed;
				this.vel.y *= this.baseSpeed / this.servingSpeed;
				this.serving = false;
			} else {
				this.vel.x *= -1.1;
				this.vel.y *= 1.1;
			}
		}

		if (Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2) > Math.pow(this.maxSpeed * 400, 2)) {
			const mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));
			const coef = this.maxSpeed * 400 / mag;
			this.vel.x *= coef;
			this.vel.y *= coef;
		}
	}

	private goToCenter() {
		this.pos.x = this.canvasSize.x / 2;
		this.pos.y = this.canvasSize.y / 2;
		this.speed = this.baseSpeed;
	}
}

export class Paddle {
	public readonly pos: Vec2;
	public readonly size: Vec2;

	private readonly canvasHeight: number;

	constructor(isLeft: boolean, canvasWidth: number, canvasHeight: number) {
		this.canvasHeight = canvasHeight;

		const primarySize = Math.min(canvasWidth / 2, canvasHeight);
		this.size = new Vec2(primarySize / 20, primarySize / 5);

		if (isLeft)
			this.pos = new Vec2(canvasWidth / 20, canvasHeight / 2 - this.size.y / 2);
		else
			this.pos = new Vec2(canvasWidth - canvasWidth / 20, canvasHeight / 2 - this.size.y / 2);
	}

	public get centerX(): number {
		return this.pos.x + this.size.x / 2;
	}

	public get centerY(): number {
		return this.pos.y + this.size.y / 2;
	}

	goToCenter() {
		this.pos.y = this.canvasHeight / 2 - this.size.y / 2;
	}

	move(dy: number) {
		this.pos.y += dy;
		if (this.pos.y < 0)
			this.pos.y = 0;
		else if (this.pos.y + this.size.y > this.canvasHeight)
			this.pos.y = this.canvasHeight - this.size.y;
	}

	render(ctx: CanvasRenderingContext2D) {
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	}
}

export class AIOnlyPongState {
	public state: PongState;

	private canvas: HTMLCanvasElement;
	private timeSinceGameOver: DOMHighResTimeStamp;

	private leftSpeed: number;
	private rightSpeed: number;

	constructor(name: string, canvas: HTMLCanvasElement, leftDifficulty: AIDifficulty, rightDifficulty: AIDifficulty) {
		this.canvas = canvas;
		this.state = new PongState(name, canvas, "Left AI", "Right AI");
		this.state.restartGame();
		this.timeSinceGameOver = 0;

		if (leftDifficulty === "Easy")
			this.leftSpeed = canvas.height / 6;
		else if (leftDifficulty === "Medium")
			this.leftSpeed = canvas.height / 4;
		else
			this.leftSpeed = canvas.height / 2;

		if (rightDifficulty === "Easy")
			this.rightSpeed = canvas.height / 6;
		else if (rightDifficulty === "Medium")
			this.rightSpeed = canvas.height / 4;
		else
			this.rightSpeed = canvas.height / 2;
	}

	update(frameTime: DOMHighResTimeStamp) {
		if (this.state.isPlaying()) {
			this.state.moveLeftPaddleAI(this.leftSpeed, frameTime);
			this.state.moveRightPaddleAI(this.rightSpeed, frameTime);
			this.state.update(frameTime);
		} else
			this.updateGameOver(frameTime);
	}

	updateGameOver(frameTime: DOMHighResTimeStamp) {
		this.timeSinceGameOver += frameTime;

		if (this.timeSinceGameOver > 3) {
			this.state.restartGame();
			this.timeSinceGameOver = 0;
		}
	}

	render() {
		this.state.render();
	}
}

export class PracticePongState {
	public readonly state: PongState;

	private readonly canvas: HTMLCanvasElement;
	private readonly aiSpeed: number;
	private readonly playerSpeed: number;

	constructor(name: string, canvas: HTMLCanvasElement, aiDifficulty: AIDifficulty) {
		this.canvas = canvas;
		this.state = new PongState(name, canvas, "AI", "Player");

		if (aiDifficulty === "Easy")
			this.aiSpeed = canvas.height / 6;
		else if (aiDifficulty === "Medium")
			this.aiSpeed = canvas.height / 4;
		else
			this.aiSpeed = canvas.height / 2;

		this.playerSpeed = canvas.height / 2;
	}

	start() {
		if (!this.state.isPlaying())
			this.state.restartGame();
	}

	update(frameTime: DOMHighResTimeStamp) {
		if (!this.state.isPlaying())
			return;

		this.state.moveLeftPaddleAI(this.aiSpeed, frameTime);
		this.handlePlayerMovement(frameTime);
		this.state.update(frameTime);
	}

	handlePlayerMovement(frameTime: DOMHighResTimeStamp) {
		if (upArrowPressed)
			this.state.moveRightPaddle(-this.playerSpeed * frameTime);
		else if (downArrowPressed)
			this.state.moveRightPaddle(this.playerSpeed * frameTime);
	}

	render() {
		this.state.render();

		if (!this.state.isPlaying()) {
			if (!this.canvas) return;
			if (!this.canvas.getContext) return;

			const ctx = this.canvas.getContext("2d");
			if (!ctx) return;

			drawText(ctx, "Press space to start...", "middle", this.canvas.width / 2, this.canvas.height / 2 + this.state.getFontSize() * 2, this.state.getFont());
		}
	}
}

let lastFrameTimestamp: DOMHighResTimeStamp = 0;
let AIOnlyGameList: AIOnlyPongState[] = new Array<AIOnlyPongState>();
let practiceGameList: PracticePongState[] = new Array<PracticePongState>();

let upArrowPressed: boolean = false;
let downArrowPressed: boolean = false;

export function startPongManager() {
	window.addEventListener("keydown", (e) => {
		if (e.key === "ArrowUp")
			upArrowPressed = true;
		else if (e.key === "ArrowDown")
			downArrowPressed = true;
	});

	window.addEventListener("keyup", (e) => {
		if (e.key === "ArrowUp")
			upArrowPressed = false;
		else if (e.key === "ArrowDown")
			downArrowPressed = false;
	});

	window.addEventListener("keypress", (e) => {
		if (e.key === " ") {
			practiceGameList.forEach((game) => {
				game.start();
			});
		}
	});

	lastFrameTimestamp = performance.now();
	window.requestAnimationFrame(updatePongGames);
}

export function updatePongGames(timestamp: DOMHighResTimeStamp) {
	AIOnlyGameList.forEach((game) => {
		game.update((timestamp - lastFrameTimestamp) / 1000.0);
		game.render();
	});

	practiceGameList.forEach((game) => {
		game.update((timestamp - lastFrameTimestamp) / 1000.0);
		game.render();
	});

	lastFrameTimestamp = timestamp;
	window.requestAnimationFrame(updatePongGames);
}

export function createNewAIOnlyGame(newGame: AIOnlyPongState) {
	AIOnlyGameList.push(newGame);
}

export function removeAiOnlyGame(name: string) {
	let index = -1;

	for (let i = 0; i < AIOnlyGameList.length; i++) {
		if (AIOnlyGameList[i].state.getName() === name) {
			index = i;
			break;
		}
	}

	if (index !== -1) {
		AIOnlyGameList.splice(index, 1);
	}
}

export function createNewPracticeGame(newGame: PracticePongState) {
	practiceGameList.push(newGame);
}

export function removePracticeGame(name: string) {
	let index = -1;

	for (let i = 0; i < practiceGameList.length; i++) {
		if (practiceGameList[i].state.getName() === name) {
			index = i;
			break;
		}
	}

	if (index !== -1) {
		practiceGameList.splice(index, 1);
	}
}