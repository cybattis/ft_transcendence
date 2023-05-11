import {PongState} from "../logic/PongState";
import {drawText} from "../util/Utils";
import {AIDifficulty} from "../PongManager";

export default class PracticePongState {
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
    else if (aiDifficulty === "Hard")
      this.aiSpeed = canvas.height / 2;
    else
      this.aiSpeed = canvas.height * 100;

    this.playerSpeed = canvas.height / 2;
  }

  start() {
    if (!this.state.isPlaying())
      this.state.restartGame();
  }

  update(frameTime: DOMHighResTimeStamp, upArrow: boolean, downArrow: boolean) {
    if (!this.state.isPlaying())
      return;

    let timeLeft = frameTime;
    while (timeLeft > 0.0001) {
      const playerMovement = this.getPlayerMovement(timeLeft, upArrow, downArrow);
      const aiMovement = this.movePaddleAI(this.state.getRightPaddleCenter().y, this.aiSpeed, timeLeft);
      timeLeft = this.state.update(aiMovement, playerMovement, timeLeft);
    }
  }

  getPlayerMovement(frameTime: DOMHighResTimeStamp, upArrowPressed: boolean, downArrowPressed: boolean): number {
    let movement = 0;
    if (upArrowPressed)
      movement += -this.playerSpeed * frameTime;
    if (downArrowPressed)
      movement += this.playerSpeed * frameTime;

    return movement;
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

  private movePaddleAI(paddleCenterY: number, speed: number, frameTime: DOMHighResTimeStamp): number {

    // Very primitive AI
    // It tracks down the exact current y position of the ball
    // The difficulty affects the max speed of the paddle
    const ballPos = this.state.getBallPos().y;
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