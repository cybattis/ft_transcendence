import {Ball, Paddle, Vec2} from "./PongManager";
import {drawText} from "./Utils";

export class PongState {
	public name: string;

	private readonly leftPaddle: Paddle;
	private readonly leftName: string;
	private leftScore: number;

	private readonly rightPaddle: Paddle;
	private readonly rightName: string;
	private rightScore: number;

	private readonly ball: Ball;

	private winner: string;
	private playing: boolean;

	private readonly primarySize: number;
	private readonly canvas: HTMLCanvasElement;
	private backgroundColor: string;
	private leftPaddleColor: string;
	private rightPaddleColor: string;
	private ballColor: string;
	private netColor: string;

	private readonly font: string;
	private readonly fontSize: number;

	constructor(name: string, canvas: HTMLCanvasElement, leftName: string, rightName: string) {
		this.name = name;
		this.canvas = canvas;
		this.leftName = leftName;
		this.rightName = rightName;

		this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height);
		this.leftPaddle = new Paddle(true, canvas.width, canvas.height);
		this.rightPaddle = new Paddle(false, canvas.width, canvas.height);

		this.leftScore = 0;
		this.rightScore = 0;

		this.backgroundColor = "rgba(0, 0, 0, 255)";
		this.leftPaddleColor = "rgba(255, 255, 255, 255)";
		this.rightPaddleColor = "rgba(255, 255, 255, 255)";
		this.ballColor = "rgba(255, 255, 255, 255)";
		this.netColor = "rgba(255, 255, 255, 255)";

		this.primarySize = Math.min(canvas.width / 2, canvas.height);
		this.fontSize = 48 * this.primarySize / 400;
		this.font = this.fontSize.toString() + "px Courier New";

		this.winner = "";
		this.playing = false;
	}

	public isPlaying(): boolean {
		return this.playing;
	}

	public getWinner(): string {
		return this.winner;
	}

	public getPrimarySize(): number {
		return this.primarySize;
	}

	public getBallPos(): Vec2 {
		return this.ball.pos;
	}

	public getLeftPaddleCenter(): Vec2 {
		return new Vec2(this.leftPaddle.centerX, this.leftPaddle.centerY);
	}

	public getRightPaddleCenter(): Vec2 {
		return new Vec2(this.rightPaddle.centerX, this.rightPaddle.centerY);
	}

	public getFont(): string {
		return this.font;
	}

	public getFontSize(): number {
		return this.fontSize;
	}

	public getName(): string {
		return this.name;
	}

	public setBackgroundColor(color: string): void {
		this.backgroundColor = color;
	}

	public setLeftPaddleColor(color: string): void {
		this.leftPaddleColor = color;
	}

	public setRightPaddleColor(color: string): void {
		this.rightPaddleColor = color;
	}

	public setBallColor(color: string): void {
		this.ballColor = color;
	}

	public setNetColor(color: string): void {
		this.netColor = color;
	}

	public update(frameTime: DOMHighResTimeStamp): void {
		if (this.playing) {
			this.ball.update(frameTime);

			const paddle = this.ball.pos.x > this.canvas.width / 2 ? this.rightPaddle : this.leftPaddle;
			this.ball.checkCollision(paddle);

			if (this.ball.pos.x + this.ball.radius > this.rightPaddle.pos.x) {
				this.ball.goToCenter();
				this.leftScore++;
			} else if (this.ball.pos.x - this.ball.radius < this.leftPaddle.pos.x + this.leftPaddle.size.x) {
				this.ball.goToCenter();
				this.rightScore++;
			}

			if (this.leftScore >= 11 && this.leftScore - this.rightScore >= 2) {
				this.playing = false;
				this.winner = this.leftName;
			} else if (this.rightScore >= 11 && this.rightScore - this.leftScore >= 2) {
				this.playing = false;
				this.winner = this.rightName;
			}
		}
	}

	public restartGame() {
		this.leftScore = 0;
		this.rightScore = 0;
		this.winner = "";

		this.leftPaddle.goToCenter();
		this.rightPaddle.goToCenter();
		this.ball.goToCenter();

		this.playing = true;
	}

	public moveLeftPaddle(amount: number): void {
		this.leftPaddle.move(amount);
	}

	public moveRightPaddle(amount: number): void {
		this.rightPaddle.move(amount);
	}

	public render() {
		if (!this.canvas) return;
		if (!this.canvas.getContext) return;

		const ctx = this.canvas.getContext("2d");
		if (!ctx) return;

		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.fillStyle = this.netColor;
		ctx.strokeStyle = this.netColor;
		ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

		this.renderPongNet(ctx);

		drawText(ctx, this.leftScore.toString(), "top", this.canvas.width / 4, 10, this.font);
		drawText(ctx, this.rightScore.toString(), "top", this.canvas.width / 4 * 3, 10, this.font);

		this.ball.render(ctx);
		this.leftPaddle.render(ctx);
		this.rightPaddle.render(ctx);

		if (!this.playing) {
			ctx.fillStyle = "rgba(25, 25, 25, 0.95)";
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			if (this.winner !== "") {
				drawText(ctx, "Game over", "middle", this.canvas.width / 2, this.canvas.height / 2 - this.fontSize / 2, this.font);
				drawText(ctx, this.winner + " wins!", "middle", this.canvas.width / 2, this.canvas.height / 2 + this.fontSize / 2, this.font);
			}
		}
	}

	public moveLeftPaddleAI(speed: number, frameTime: DOMHighResTimeStamp) {
		this.movePaddleAI(this.leftPaddle, speed, frameTime);
	}

	public moveRightPaddleAI(speed: number, frameTime: DOMHighResTimeStamp) {
		this.movePaddleAI(this.rightPaddle, speed, frameTime);
	}

	private movePaddleAI(paddle: Paddle, speed: number, frameTime: DOMHighResTimeStamp) {

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

	private renderPongNet(ctx: CanvasRenderingContext2D) {
		const desiredHeight = this.primarySize / 20;
		const remainder = this.canvas.height % desiredHeight;
		let quotient = Math.floor(this.canvas.height / desiredHeight);

		let actualHeight = desiredHeight + remainder / quotient;

		if (quotient % 2 === 0) {
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