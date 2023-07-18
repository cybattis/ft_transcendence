import {PongLogic} from "../logic/PongLogic";
import {drawText} from "../util/Utils";
import {AIDifficulty, PongAi} from "../logic/PongAi";

export default class PracticePongState {
  public readonly state: PongLogic;

  private readonly canvas: HTMLCanvasElement;
  private readonly playerSpeed: number;
  private ai: PongAi;

  constructor(name: string, canvas: HTMLCanvasElement, aiDifficulty: AIDifficulty) {
    this.canvas = canvas;
    this.state = new PongLogic(name, canvas, "AI", "Player");
    this.ai = new PongAi(this.state.getLeftPaddle(), aiDifficulty, canvas, this.state);
    this.playerSpeed = canvas.height * 0.8;
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
      const aiMovement = this.ai.getMovement(timeLeft);
      timeLeft = this.state.update(aiMovement, this.ai.maxSpeed, playerMovement, this.playerSpeed, timeLeft);
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
}