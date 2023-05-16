import {PongState} from "../logic/PongState";
import {AIDifficulty} from "../PongManager";

export default class AIOnlyPongState {
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
    else if (leftDifficulty === "Hard")
      this.leftSpeed = canvas.height / 2;
    else
      this.leftSpeed = canvas.height * 100;

    if (rightDifficulty === "Easy")
      this.rightSpeed = canvas.height / 6;
    else if (rightDifficulty === "Medium")
      this.rightSpeed = canvas.height / 4;
    else if (rightDifficulty === "Hard")
      this.rightSpeed = canvas.height / 2;
    else
      this.rightSpeed = canvas.height * 100;
  }

  update(frameTime: DOMHighResTimeStamp) {
    if (this.state.isPlaying()) {
      let timeLeft = frameTime;
      while (timeLeft > 0.0001) {
        const leftMovement = this.movePaddleAI(this.state.getLeftPaddleCenter().y, this.leftSpeed, timeLeft);
        const rightMovement = this.movePaddleAI(this.state.getRightPaddleCenter().y, this.rightSpeed, timeLeft);
        timeLeft = this.state.update(leftMovement, rightMovement, timeLeft);
      }
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

  private movePaddleAI(paddleCenterY: number, speed: number, frameTime: DOMHighResTimeStamp): number {

    // Very primitive AI
    // It tracks down the exact current y position of the ball
    // The difficulty affects the max speed of the paddle
    const ballPos = this.state.getBallEnding().y;
    const delta = ballPos - paddleCenterY;
    if (Math.abs(delta) <= speed * frameTime) {
      return delta;
    } else {
      if (delta >= 0)
        return speed * frameTime;
      else
        return -speed * frameTime;
    }
  }
}