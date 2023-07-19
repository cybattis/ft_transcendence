import Vec2 from "../util/Vec2";
import Ball from "../logic/Ball";
import Paddle from "../logic/Paddle";
import {drawText} from "../util/Utils";
import { MultiplayerClient } from "../networking/multiplayer-client";
import { BallUpdate, ScoreUpdate, ServeUpdate } from "../networking/types";

export class MultiplayerPongLogic {
  public name: string;

  private playerNumber: number;
  private readonly opponentPaddle: Paddle;
  private readonly opponentName: string;
  private opponentScore: number;

  private readonly playerPaddle: Paddle;
  private readonly playerName: string;
  private playerScore: number;

  private readonly ball: Ball;

  private readonly paddleMaxStepSize: number;
  private readonly ballMaxStepSize: number;

  private winner: string;
  private playing: boolean;
  private ended: boolean;
  private waitingForServer: boolean;
  private waitingForGameToStart: boolean;

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
    this.playerNumber = 0;
    this.canvas = canvas;
    this.opponentName = leftName;
    this.playerName = rightName;

    this.opponentPaddle = new Paddle(true, canvas.width, canvas.height);
    this.playerPaddle = new Paddle(false, canvas.width, canvas.height);
    this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width, this.canvas.height, this.opponentPaddle.size.x);

    const ballMaxStepSizeX = Math.min(this.opponentPaddle.size.x / 2, this.canvas.width / 5);
    const ballMaxStepSizeY = this.canvas.height / 5;
    this.ballMaxStepSize = Math.min(ballMaxStepSizeX, ballMaxStepSizeY);
    this.paddleMaxStepSize = this.ball.radius;

    this.opponentScore = 0;
    this.playerScore = 0;

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
    this.ended = false;
    this.waitingForServer = false;
    this.waitingForGameToStart = false;
  }

  public setPlayerNumber(playerNumber: number): void {
    this.playerNumber = playerNumber;
  }

  public getPlayerNumber(): number {
    return this.playerNumber;
  }

  public isWaitingForServer(): boolean {
    return this.waitingForServer;
  }

  public isWaitingForGameToStart(): boolean {
    return this.waitingForGameToStart;
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public isEnded(): boolean {
    return this.ended;
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

  public getOpponentPaddleCenter(): Vec2 {
    return new Vec2(this.opponentPaddle.centerX, this.opponentPaddle.centerY);
  }

  public getPlayerPaddleCenter(): Vec2 {
    return new Vec2(this.playerPaddle.centerX, this.playerPaddle.centerY);
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

  public getOpponentPaddle(): Paddle {
    return this.opponentPaddle;
  }

  public getPlayerPaddle(): Paddle {
    return this.playerPaddle;
  }

  public setBackgroundColor(color: string): void {
    this.backgroundColor = color;
  }

  public setOpponentPaddleColor(color: string): void {
    this.leftPaddleColor = color;
  }

  public setPlayerPaddleColor(color: string): void {
    this.rightPaddleColor = color;
  }

  public setBallColor(color: string): void {
    this.ballColor = color;
  }

  public setNetColor(color: string): void {
    this.netColor = color;
  }

  public update(playerMovement: number, playerMaxSpeed: number, frameTime: DOMHighResTimeStamp): number {
    if (this.playing && !this.waitingForGameToStart && !this.waitingForServer && !this.ended) {
      // Calculate the number of sub updates to perform based on the maximum step size
      const rightPaddleStepTime = this.calculatePaddleStepTime(playerMovement, frameTime);
      const ballStepTime = this.ball.calculateStepTime(this.ballMaxStepSize, frameTime);
      const stepTime = Math.min(rightPaddleStepTime, ballStepTime);

      // Move paddles and ball by a fraction of the total movement
      const realRightMaxSpeed = playerMaxSpeed * stepTime;
      const realRightMovement = Math.max(-realRightMaxSpeed, Math.min(realRightMaxSpeed, playerMovement));
      this.playerPaddle.move(realRightMovement);
      this.ball.update(stepTime);

      const paddle: Paddle = this.ball.pos.x > this.canvas.width / 2 ? this.playerPaddle : this.opponentPaddle;
      // Check for collisions
      if (this.ball.checkCollision(this.playerPaddle) && paddle.pos.x > this.canvas.width / 2) {
        // If the ball collided with a paddle, send the new ball position and direction to the server
        if (this.playerNumber === 1) {
          const ballUpdate: BallUpdate = {
            x: (this.canvas.width - this.ball.pos.x) / this.canvas.width,
            y: this.ball.pos.y / this.canvas.height,
            velX: -this.ball.vel.x / this.canvas.width,
            velY: this.ball.vel.y / this.canvas.height
          }
          MultiplayerClient.sendBallUpdate(ballUpdate);
        } else if (this.playerNumber === 2) {
          const ballUpdate: BallUpdate = {
            x: this.ball.pos.x / this.canvas.width,
            y: this.ball.pos.y / this.canvas.height,
            velX: this.ball.vel.x / this.canvas.width,
            velY: this.ball.vel.y / this.canvas.height
          }
          MultiplayerClient.sendBallUpdate(ballUpdate);
        }
      }

      // Check for scoring
      if (this.ball.pos.x + this.ball.radius > this.playerPaddle.pos.x) {
        MultiplayerClient.sendGoal();
        this.waitingForServer = true;
        return 0;
      }

      return frameTime - stepTime;
    }

    return 0;
  }

  public setOpponentPosition(yPos: number): void {
    this.opponentPaddle.pos.y = yPos * this.canvas.height;
  }

  public setBallMovement(ballMovement: BallUpdate): void {
    this.ball.pos.y = ballMovement.y * this.canvas.height;
    this.ball.vel.y = ballMovement.velY * this.canvas.height;
    if (this.playerNumber === 1) {
      this.ball.pos.x = this.canvas.width - (ballMovement.x * this.canvas.width);
      this.ball.vel.x = -ballMovement.velX * this.canvas.width;
    } else if (this.playerNumber === 2) {
      this.ball.pos.x = ballMovement.x * this.canvas.width;
      this.ball.vel.x = ballMovement.velX * this.canvas.width;
    }
  }

  public waitForGameToStart(): void {
    this.waitingForGameToStart = true;
  }

  public startGame(serveUpdate: ServeUpdate): void {
    this.waitingForGameToStart = false;
    this.waitingForServer = false;
    this.playing = true;
    this.serve(serveUpdate);
  }

  public endGame(): void {
    this.playing = false;
    this.ended = true;
  }

  public updateScore(scoreUpdate: ScoreUpdate) {
    if (this.playerNumber === 1) {
      this.playerScore = scoreUpdate.player1Score;
      this.opponentScore = scoreUpdate.player2Score;
    } else {
      this.playerScore = scoreUpdate.player2Score;
      this.opponentScore = scoreUpdate.player1Score;
    }
  }

  public serve(serveUpdate: ServeUpdate) {
    this.setBallMovement(serveUpdate.ballUpdate);
    if (this.playerNumber === serveUpdate.playerNumber)
      this.ball.setServing(true);
    this.waitingForServer = false;
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

    drawText(ctx, this.opponentScore.toString(), "top", this.canvas.width / 4, 10, this.font);
    drawText(ctx, this.playerScore.toString(), "top", this.canvas.width / 4 * 3, 10, this.font);

    ctx.fillStyle = this.leftPaddleColor;
    this.opponentPaddle.render(ctx);
    ctx.fillStyle = this.rightPaddleColor;
    this.playerPaddle.render(ctx);
    ctx.fillStyle = this.ballColor;
    this.ball.render(ctx);

    if (!this.playing) {
      ctx.fillStyle = "rgba(25, 25, 25, 0.95)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.waitingForGameToStart) {
        drawText(ctx, "Waiting for game to start...", "middle", this.canvas.width / 2, this.canvas.height / 2 + this.fontSize / 2, this.font);
      } else if (this.winner !== "") {
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