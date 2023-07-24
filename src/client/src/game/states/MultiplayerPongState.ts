import { drawText } from "../util/Utils";
import { MultiplayerPongLogic } from "../logic/MultiplayerPongLogic";
import { MultiplayerClient } from "../networking/multiplayer-client";
import { BallUpdate, MovementUpdate, ScoreUpdate, ServeUpdate } from "../networking/types";
import { RgbColor } from "../../utils/colors";

export default class MultiplayerPongState {
  public readonly state: MultiplayerPongLogic;

  private readonly canvas: HTMLCanvasElement;
  private readonly playerSpeed: number;

  constructor(name: string, canvas: HTMLCanvasElement,
              paddleColor: RgbColor, opponentPaddleColor: RgbColor)
  {
    this.canvas = canvas;
    this.state = new MultiplayerPongLogic(name, canvas);
    this.state.setPlayerPaddleColor(paddleColor);
    this.state.setOpponentPaddleColor(opponentPaddleColor);
    this.playerSpeed = canvas.height * 0.8;

    MultiplayerClient.checkConnection();

    MultiplayerClient.onReadyAck((playerNumber: number): void => {
      this.state.setPlayerNumber(playerNumber);
    });

    MultiplayerClient.onGameStarted((serveUpdate: ServeUpdate) => {
      this.state.startGame(serveUpdate);
    });

    MultiplayerClient.onGameEnded((): void => {
      this.state.endGame();
    });

    MultiplayerClient.onScoreUpdate((scoreUpdate: ScoreUpdate): void => {
      this.state.updateScore(scoreUpdate);
    });

    MultiplayerClient.onMovementUpdate((movementUpdate: MovementUpdate): void => {
      this.state.setOpponentPosition(movementUpdate.finalY);
    });

    MultiplayerClient.onBallUpdate((ballUpdate: BallUpdate): void => {
      this.state.setBallMovement(ballUpdate);
    });

    MultiplayerClient.onServe((serveUpdate: ServeUpdate): void => {
      this.state.serve(serveUpdate);
    });
  }

  public removeCallbacks(): void {
    MultiplayerClient.removeCallbacks();
  }

  readyUp() {
    if (!this.state.isWaitingForGameToStart() && !this.state.isPlaying() && !this.state.isEnded()) {
      MultiplayerClient.sendReady();
      this.state.waitForGameToStart();
    }
  }

  update(frameTime: DOMHighResTimeStamp, upArrow: boolean, downArrow: boolean) {
    if (!this.state.isPlaying() || this.state.isWaitingForServer())
      return;

    let timeLeft = frameTime;
    while (timeLeft > 0.0001) {
      const playerMovement = this.getPlayerMovement(timeLeft, upArrow, downArrow);
      timeLeft = this.state.update(playerMovement, this.playerSpeed, timeLeft);
    }

    // Send final paddle position to the client
    const movementUpdate: MovementUpdate = {
      playerNumber: this.state.getPlayerNumber(),
      finalY: this.state.getPlayerPaddle().pos.y / this.canvas.height
    }
    MultiplayerClient.sendMovementUpdate(movementUpdate);
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