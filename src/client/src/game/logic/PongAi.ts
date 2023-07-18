import {PongLogic} from "./PongLogic";
import Paddle from "./Paddle";

export type AIDifficulty = "Easy" | "Medium" | "Hard" | "Godlike";

export class PongAi {
  private canvas: HTMLCanvasElement;
  private state: PongLogic;
  private paddle: Paddle;

  private readonly isLeft: boolean;

  private readonly speed: number;
  private readonly errorFactor: number;
  private readonly timeToUpdate: number;
  private timeSinceUpdate: number;
  private returnToCenter: boolean;
  private targetPos: number;

  constructor(paddle: Paddle, difficulty: AIDifficulty, canvas: HTMLCanvasElement, state: PongLogic) {
    this.canvas = canvas;
    this.state = state;
    this.paddle = paddle;

    this.timeSinceUpdate = 0;
    this.targetPos = canvas.height / 2;

    this.isLeft = paddle.pos.x < canvas.width / 2;

    if (difficulty === "Easy") {
      this.speed = canvas.height * 0.8;
      this.errorFactor = 0.5;
      this.timeToUpdate = 0.1;
      this.returnToCenter = false;
    } else if (difficulty === "Medium") {
      this.speed = canvas.height * 0.8;
      this.errorFactor = 0.25;
      this.timeToUpdate = 0.5;
      this.returnToCenter = true;
    } else if (difficulty === "Hard") {
      this.speed = canvas.height * 0.8;
      this.errorFactor = 0.125;
      this.timeToUpdate = 0.25;
      this.returnToCenter = true;
    } else {
      this.speed = canvas.height * 100000000000;
      this.errorFactor = 0;
      this.timeToUpdate = 0;
      this.returnToCenter = true;
    }
  }

  public get maxSpeed(): number {
    return this.speed;
  }

  public getMovement(frameTime: DOMHighResTimeStamp): number {
    if (this.isBallGoingAway()) {
      if (this.returnToCenter)
        return this.calculateMovement(this.canvas.height / 2, frameTime);
      else
        return 0;
    }

    this.timeSinceUpdate += frameTime;
    if (this.timeSinceUpdate > this.timeToUpdate) {
      this.timeSinceUpdate -= this.timeToUpdate;
      this.updateTargetPos();
    }

    return this.calculateMovement(this.targetPos, frameTime);
  }

  private calculateMovement(targetY: number, frameTime: DOMHighResTimeStamp): number {
    const maxMovement = this.speed * frameTime;
    const minMovement = -maxMovement;
    return Math.max(minMovement, Math.min(maxMovement, targetY - this.paddle.centerY));
  }

  private updateTargetPos() {
    const ballEndingPos = this.state.getBallEnding();
    const ballDistanceFactor = Math.abs(this.state.getBallPos().x - this.paddle.centerX) / (this.canvas.width / 6);
    this.targetPos = ballEndingPos.y + (Math.random() - 0.5) * this.errorFactor * this.canvas.height * ballDistanceFactor;
    console.log(this.targetPos, ballEndingPos.y);
  }

  private isBallGoingAway(): boolean {
    return this.isLeft ? this.state.getBallVel().x > 0 : this.state.getBallVel().x < 0;
  }
}