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
	private maxSpeed: number;

	constructor(x: number, y: number, radius: number, canvasWidth: number, canvasHeight: number, speed: number, direction: number) {
		this.pos = new Vec2(x, y);
		this.radius = radius;
		this.canvasSize = new Vec2(canvasWidth, canvasHeight);
		this.speed = speed;

		this.vel = new Vec2(Math.cos(direction) * this.speed, Math.sin(direction) * this.speed);

		const primarySize = Math.min(canvasWidth / 2, canvasHeight);
		this.maxSpeed = primarySize / 40;
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

			this.vel.x *= -1.1;
			this.vel.y *= 1.1;
		}

		if (Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2) > Math.pow(this.maxSpeed * 400, 2)) {
			const mag = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));
			const coef = this.maxSpeed * 400 / mag;
			this.vel.x *= coef;
			this.vel.y *= coef;
		}
	}
}

export class Paddle {
	public readonly pos: Vec2;
	public readonly size: Vec2;

	private canvasHeight: number;

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
	public name: string;
	public canvas: HTMLCanvasElement;

	public leftSpeed: number;
	public leftPaddle: Paddle;
	public rightSpeed: number;
	public rightPaddle: Paddle;

	public ball: Ball;

	constructor(name: string, canvas: HTMLCanvasElement, leftDifficulty: AIDifficulty, rightDifficulty: AIDifficulty) {
		this.name = name;
		this.canvas = canvas;
		this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, 10, this.canvas.width, this.canvas.height, 150, Math.PI / 4);
		this.leftPaddle = new Paddle(true, canvas.width, canvas.height);
		this.rightPaddle = new Paddle(false, canvas.width, canvas.height);

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
		this.ball.update(frameTime);

		this.movePaddle(this.leftPaddle, this.leftSpeed, frameTime);
		this.movePaddle(this.rightPaddle, this.rightSpeed, frameTime);

		const paddle = this.ball.pos.x > this.canvas.width / 2 ? this.rightPaddle : this.leftPaddle;
		this.ball.checkCollision(paddle);

		if (this.ball.pos.x + this.ball.radius > this.rightPaddle.pos.x ||
			this.ball.pos.x - this.ball.radius < this.leftPaddle.pos.x + this.leftPaddle.size.x) {
			this.ball.goToCenter();
		}
	}

	movePaddle(paddle: Paddle, speed: number, frameTime: DOMHighResTimeStamp) {

		// Very primitive AI
		// It tracks down the exact current y position of the ball
		// The difficulty affects the max speed of the paddle
		const ballPos = this.ball.pos.y;
		const delta = ballPos - paddle.centerY;
		if (Math.abs(delta) <= speed * frameTime) {
			paddle.move(delta);
		} else {
			if (delta >= 0)
				paddle.move(speed * frameTime);
			else
				paddle.move(-speed *  frameTime);
		}
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

		this.renderNet(ctx);

		this.ball.render(ctx);
		this.leftPaddle.render(ctx);
		this.rightPaddle.render(ctx);
	}

	renderNet(ctx: CanvasRenderingContext2D) {
		const primarySize = Math.min(this.canvas.width / 2, this.canvas.height);
		const desiredHeight = primarySize / 20;
		const remainder = this.canvas.height % desiredHeight;
		let quotient = Math.floor(this.canvas.height / desiredHeight);

		let actualHeight = desiredHeight + remainder / quotient;

		if (quotient % 2 == 0) {
			actualHeight += actualHeight / (quotient - 1);
			quotient -= 1;
		}

		for (let i = 0; i < quotient; i += 2) {
			ctx.fillRect(
				this.canvas.width / 2 - desiredHeight / 2,
				i * actualHeight,
				desiredHeight,
				actualHeight);
		}

		ctx.fillRect(
			this.canvas.width / 2 - desiredHeight / 2,
			this.canvas.height - actualHeight,
			desiredHeight,
			actualHeight);
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