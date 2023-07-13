import Vec2 from "../util/Vec2";
import Ball from "../logic/Ball";
import Paddle from "../logic/Paddle";
import {drawText} from "../util/Utils";

export type MovementCallback = (ballPos: number, paddlePos: number) => number;

export class PongLogic {
  public name: string;
  private readonly leftPaddle: Paddle;
  private readonly leftName: string;
  private leftScore: number;

  private readonly rightPaddle: Paddle;
  private readonly rightName: string;
  private rightScore: number;

  private readonly ball: Ball;

  private readonly paddleMaxStepSize: number;
  private readonly ballMaxStepSize: number;

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

    this.leftPaddle = new Paddle(true, canvas.width, canvas.height);
    this.rightPaddle = new Paddle(false, canvas.width, canvas.height);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height, this.leftPaddle.size.x);
    if (Math.random() > 0.5)
      this.ball.serveRight();
    else
      this.ball.serveLeft();

    const ballMaxStepSizeX = Math.min(this.leftPaddle.size.x / 2, this.canvas.width / 5);
    const ballMaxStepSizeY = this.canvas.height / 5;
    this.ballMaxStepSize = Math.min(ballMaxStepSizeX, ballMaxStepSizeY);
    this.paddleMaxStepSize = this.ball.radius;

    this.leftScore = 0;
    this.rightScore = 0;

    this.backgroundColor = "rgba(0, 0, 0, 1)";
    this.leftPaddleColor = "rgba(255, 255, 255, 1)";
    this.rightPaddleColor = "rgba(255, 255, 255, 1)";
    this.ballColor = "rgba(255, 255, 255, 1)";
    this.netColor = "rgba(255, 255, 255, 1)";

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

  public getBallVel(): Vec2 {
    return this.ball.vel;
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

  public getLeftPaddle(): Paddle {
    return this.leftPaddle;
  }

  public getRightPaddle(): Paddle {
    return this.rightPaddle;
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

  public update(leftMovement: number, leftMaxSpeed: number,
                rightMovement: number, rightMaxSpeed: number,
                frameTime: DOMHighResTimeStamp): number {
    if (this.playing) {
      // Calculate the number of sub updates to perform based on the maximum step size
      const leftPaddlestepTime = this.calculatePaddleStepTime(leftMovement, frameTime);
      const rightPaddlestepTime = this.calculatePaddleStepTime(rightMovement, frameTime);
      const ballstepTime = this.ball.calculateStepTime(this.ballMaxStepSize, frameTime);
      const stepTime = Math.min(leftPaddlestepTime, rightPaddlestepTime, ballstepTime);

      // Move paddles and ball by a fraction of the total movement
      const realLeftMaxSpeed = leftMaxSpeed * stepTime;
      const realLeftMovement = Math.max(-realLeftMaxSpeed, Math.min(realLeftMaxSpeed, leftMovement));
      this.leftPaddle.move(realLeftMovement);
      const realRightMaxSpeed = rightMaxSpeed * stepTime;
      const realRightMovement = Math.max(-realRightMaxSpeed, Math.min(realRightMaxSpeed, rightMovement));
      this.rightPaddle.move(realRightMovement);
      this.ball.update(stepTime);

      // Check for collisions
      const paddle = this.ball.pos.x > this.canvas.width / 2 ? this.rightPaddle : this.leftPaddle;
      if (this.ball.checkCollision(paddle)) {

      }

      // Check for scoring
      if (this.ball.pos.x + this.ball.radius > this.rightPaddle.pos.x) {
        this.ball.serveLeft();
        this.leftScore++;
      } else if (this.ball.pos.x - this.ball.radius < this.leftPaddle.pos.x + this.leftPaddle.size.x) {
        this.ball.serveRight();
        this.rightScore++;
      }

      // Check for game over
      if (this.leftScore >= 11 && this.leftScore - this.rightScore >= 2) {
        this.playing = false;
        this.winner = this.leftName;
      } else if (this.rightScore >= 11 && this.rightScore - this.leftScore >= 2) {
        this.playing = false;
        this.winner = this.rightName;
      }

      return frameTime - stepTime;
    }

    return 0;
  }

  public getBallEnding(): Vec2 {
    if (this.ball.vel.x > 0) {
      const xOffset = (this.rightPaddle.pos.x - this.ball.radius) - this.ball.pos.x;
      const xCoef = xOffset / this.ball.vel.x;
      const yPos = this.ball.pos.y + this.ball.vel.y * xCoef;
      const xPos = this.ball.pos.x + this.ball.vel.x * xCoef;
      return new Vec2(xPos, yPos);
    } else {
      const xOffset = this.ball.pos.x - (this.ball.radius + this.leftPaddle.pos.x + this.leftPaddle.size.x);
      const xCoef = xOffset / -this.ball.vel.x;
      const yPos = this.ball.pos.y + this.ball.vel.y * xCoef;
      const xPos = this.ball.pos.x + this.ball.vel.x * xCoef;
      return new Vec2(xPos, yPos);
    }
  }

  public restartGame() {
    this.leftScore = 0;
    this.rightScore = 0;
    this.winner = "";

    this.leftPaddle.goToCenter();
    this.rightPaddle.goToCenter();

    if (Math.random() > 0.5)
      this.ball.serveRight();
    else
      this.ball.serveLeft();

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

    ctx.fillStyle = this.leftPaddleColor;
    this.leftPaddle.render(ctx);
    ctx.fillStyle = this.rightPaddleColor;
    this.rightPaddle.render(ctx);
    ctx.fillStyle = this.ballColor;
    this.ball.render(ctx);

    if (!this.playing) {
      ctx.fillStyle = "rgba(25, 25, 25, 0.95)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.winner !== "") {
        drawText(ctx, "Game over", "middle", this.canvas.width / 2, this.canvas.height / 2 - this.fontSize / 2, this.font);
        drawText(ctx, this.winner + " wins!", "middle", this.canvas.width / 2, this.canvas.height / 2 + this.fontSize / 2, this.font);
      }
    }
  }

  private calculatePaddleStepTime(paddleMovement: number, frameTime: DOMHighResTimeStamp): number {
    // Calculate the distance the paddle would move in this frame
    const paddleStep = Math.abs(paddleMovement * frameTime);

    if (paddleStep > this.paddleMaxStepSize) {
      return frameTime * (this.paddleMaxStepSize / paddleStep);
    }

    return frameTime;
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