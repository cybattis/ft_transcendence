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
	private readonly baseSpeed: number;
	private readonly maxSpeed: number;

	constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
		this.pos = new Vec2(x, y);

		const primarySize = Math.min(canvasWidth / 2, canvasHeight);
		this.radius = primarySize / 40;
		this.maxSpeed = primarySize / 40;
		this.speed = primarySize / 2;
		this.baseSpeed = primarySize / 2;
		this.canvasSize = new Vec2(canvasWidth, canvasHeight);

		this.vel = new Vec2(0, 0);
		this.getRandomDirection();
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
		this.speed = this.baseSpeed;
		this.getRandomDirection();
	}

	getRandomDirection() {
		const direction = Math.random() < 0.5 ? Math.random() * Math.PI / 2 - Math.PI / 4 : Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
		this.vel.x = Math.cos(direction) * this.speed;
		this.vel.y = -Math.sin(direction) * this.speed;
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
	public leftScore: number;
	public leftPaddle: Paddle;
	public rightSpeed: number;
	public rightScore: number;
	public rightPaddle: Paddle;

	public ball: Ball;

	constructor(name: string, canvas: HTMLCanvasElement, leftDifficulty: AIDifficulty, rightDifficulty: AIDifficulty) {
		this.name = name;
		this.canvas = canvas;
		this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height);
		this.leftPaddle = new Paddle(true, canvas.width, canvas.height);
		this.rightPaddle = new Paddle(false, canvas.width, canvas.height);

		this.leftScore = 0;
		this.rightScore = 0;

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

		if (this.ball.pos.x + this.ball.radius > this.rightPaddle.pos.x) {
			this.ball.goToCenter();
			this.leftScore++;
		} else if (this.ball.pos.x - this.ball.radius < this.leftPaddle.pos.x + this.leftPaddle.size.x) {
			this.ball.goToCenter();
			this.rightScore++;
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
				paddle.move(-speed * frameTime);
		}
	}

	render() {
		if (!this.canvas) return;
		if (!this.canvas.getContext) return;

		const ctx = this.canvas.getContext("2d");
		if (!ctx) return;

		renderPongGame(ctx, this.leftPaddle, this.rightPaddle, this.ball, this.leftScore, this.rightScore, this.canvas);
	}
}

export class PracticePongState {
	public name: string;
	public canvas: HTMLCanvasElement;
	public started: boolean;

	public aiSpeed: number;
	public aiScore: number;
	public aiPaddle: Paddle;

	public playerSpeed: number;
	public playerScore: number;
	public playerPaddle: Paddle;

	public ball: Ball;

	constructor(name: string, canvas: HTMLCanvasElement, aiDifficulty: AIDifficulty) {
		this.name = name;
		this.canvas = canvas;
		this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height);
		this.aiPaddle = new Paddle(true, canvas.width, canvas.height);
		this.playerPaddle = new Paddle(false, canvas.width, canvas.height);

		this.aiScore = 0;
		this.playerScore = 0;

		if (aiDifficulty === "Easy")
			this.aiSpeed = canvas.height / 6;
		else if (aiDifficulty === "Medium")
			this.aiSpeed = canvas.height / 4;
		else
			this.aiSpeed = canvas.height / 2;

		this.playerSpeed = canvas.height / 2;

		this.started = false;
	}

	start() {
		this.started = true;
	}

	update(frameTime: DOMHighResTimeStamp) {
		this.ball.update(frameTime);

		this.moveAIPaddle(frameTime);
		this.handlePlayerMovement(frameTime);

		const paddle = this.ball.pos.x > this.canvas.width / 2 ? this.playerPaddle : this.aiPaddle;
		this.ball.checkCollision(paddle);

		if (this.ball.pos.x + this.ball.radius > this.playerPaddle.pos.x) {
			this.ball.goToCenter();
			this.aiScore++;
		} else if (this.ball.pos.x - this.ball.radius < this.aiPaddle.pos.x + this.aiPaddle.size.x) {
			this.ball.goToCenter();
			this.playerScore++;
		}
	}

	moveAIPaddle(frameTime: DOMHighResTimeStamp) {

		// Very primitive AI
		// It tracks down the exact current y position of the ball
		// The difficulty affects the max speed of the paddle
		const ballPos = this.ball.pos.y;
		const delta = ballPos - this.aiPaddle.centerY;
		if (Math.abs(delta) <= this.aiSpeed * frameTime) {
			this.aiPaddle.move(delta);
		} else {
			if (delta >= 0)
				this.aiPaddle.move(this.aiSpeed * frameTime);
			else
				this.aiPaddle.move(-this.aiSpeed * frameTime);
		}
	}

	handlePlayerMovement(frameTime: DOMHighResTimeStamp) {
		if (upArrowPressed)
			this.playerPaddle.move(-this.playerSpeed * frameTime);
		else if (downArrowPressed)
			this.playerPaddle.move(this.playerSpeed * frameTime);
	}

	render() {
		if (!this.canvas) return;
		if (!this.canvas.getContext) return;

		const ctx = this.canvas.getContext("2d");
		if (!ctx) return;

		renderPongGame(ctx, this.aiPaddle, this.playerPaddle, this.ball, this.aiScore, this.playerScore, this.canvas);
		if (!this.started) {
			ctx.fillStyle = "rgba(25, 25, 25, 0.9)";
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}

		if (!this.started) {
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const primarySize = Math.min(this.canvas.width / 2, this.canvas.height);
			ctx.font = (48 * primarySize / 400).toString() + "px Courier New";
			ctx.fillStyle = "rgba(255, 255, 255, 1)";
			ctx.fillText("Press space to start...", this.canvas.width / 2, this.canvas.height / 2);
		}
	}
}

function renderPongGame(ctx: CanvasRenderingContext2D,
						leftPaddle: Paddle, rightPaddle: Paddle,
						ball: Ball, leftScore: number, rightScore: number,
						canvas: HTMLCanvasElement) {
	ctx.fillStyle = "rgba(0, 0, 0, 255)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "rgba(255, 255, 255, 255)";
	ctx.strokeStyle = "rgba(255, 255, 255, 255)";
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	renderPongNet(ctx, canvas);

	ctx.textAlign = "center";
	ctx.textBaseline = "hanging";

	const primarySize = Math.min(canvas.width / 2, canvas.height);
	ctx.font = (48 * primarySize / 200).toString() + "px Courier New";
	ctx.fillText(leftScore.toString(), canvas.width / 2 + primarySize / 5, 10);
	ctx.fillText(rightScore.toString(), canvas.width / 2 - primarySize / 5, 10);

	ball.render(ctx);
	leftPaddle.render(ctx);
	rightPaddle.render(ctx);
}

function renderPongNet(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
	const primarySize = Math.min(canvas.width / 2, canvas.height);
	const desiredHeight = primarySize / 20;
	const remainder = canvas.height % desiredHeight;
	let quotient = Math.floor(canvas.height / desiredHeight);

	let actualHeight = desiredHeight + remainder / quotient;

	if (quotient % 2 === 0) {
		actualHeight += actualHeight / (quotient - 1);
		quotient -= 1;
	}

	for (let i = 0; i < quotient; i += 2) {
		ctx.fillRect(
			canvas.width / 2 - desiredHeight / 2,
			i * actualHeight,
			desiredHeight,
			actualHeight);
	}

	ctx.fillRect(
		canvas.width / 2 - desiredHeight / 2,
		canvas.height - actualHeight,
		desiredHeight,
		actualHeight);
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
		else if (e.key === " ") {
			practiceGameList.forEach((game) => {
				game.start();
			});
		}
	});

	window.addEventListener("keyup", (e) => {
		if (e.key === "ArrowUp")
			upArrowPressed = false;
		else if (e.key === "ArrowDown")
			downArrowPressed = false;
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
		if (game.started)
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
		if (AIOnlyGameList[i].name === name) {
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
		if (practiceGameList[i].name === name) {
			index = i;
			break;
		}
	}

	if (index !== -1) {
		practiceGameList.splice(index, 1);
	}
}