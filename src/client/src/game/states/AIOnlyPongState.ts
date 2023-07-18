import {PongLogic} from "../logic/PongLogic";
import {AIDifficulty, PongAi} from "../logic/PongAi";

export default class AIOnlyPongState {
  public state: PongLogic;

  private canvas: HTMLCanvasElement;
  private timeSinceGameOver: DOMHighResTimeStamp;
  private leftAi: PongAi;
  private rightAi: PongAi;

  constructor(name: string, canvas: HTMLCanvasElement, leftDifficulty: AIDifficulty, rightDifficulty: AIDifficulty) {
    this.canvas = canvas;
    this.state = new PongLogic(name, canvas, "Left AI", "Right AI");
    this.state.restartGame();
    this.timeSinceGameOver = 0;

    this.leftAi = new PongAi(this.state.getLeftPaddle(), leftDifficulty, canvas, this.state);
    this.rightAi = new PongAi(this.state.getRightPaddle(), rightDifficulty, canvas, this.state);
  }

  update(frameTime: DOMHighResTimeStamp) {
    if (this.state.isPlaying()) {
      let timeLeft = frameTime;
      while (timeLeft > 0.0001) {
        const leftMovement = this.leftAi.getMovement(timeLeft);
        const rightMovement = this.rightAi.getMovement(timeLeft);
        timeLeft = this.state.update(leftMovement, this.leftAi.maxSpeed, rightMovement, this.rightAi.maxSpeed, timeLeft);
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
}