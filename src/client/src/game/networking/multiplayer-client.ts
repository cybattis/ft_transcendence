import {
  MultiplayerGameStartedCallback,
  MultiplayerGameEndedCallback,
  MultiplayerBallUpdateCallback,
  MultiplayerMovementUpdateCallback,
  MultiplayerScoreUpdateCallback,
  MultiplayerReadyAckCallback,
  MultiplayerServeCallback,
  BallUpdate,
  MovementUpdate,
  ScoreUpdate,
  ServeUpdate,
} from "./types";
import { SocketManager } from "../../utils/socketManager";
import Config from "../../utils/Config";

export namespace MultiplayerClient {
  import SocketParameters = SocketManager.SocketParameters;
  import ManagedSocket = SocketManager.ManagedSocket;
  let socket: ManagedSocket;
  let gameStartedCallback: MultiplayerGameStartedCallback = (
    serveUpdate: ServeUpdate
  ): void => {};
  let gameEndedCallback: MultiplayerGameEndedCallback[] = [];
  let movementUpdateCallback: MultiplayerMovementUpdateCallback = (
    movementUpdate: MovementUpdate
  ): void => {};
  let ballUpdateCallback: MultiplayerBallUpdateCallback = (
    ballUpdate: BallUpdate
  ): void => {};
  let serveCallback: MultiplayerServeCallback = (
    serveUpdate: ServeUpdate
  ): void => {};
  let scoreUpdateCallback: MultiplayerScoreUpdateCallback = (
    scoreUpdate: ScoreUpdate
  ): void => {};
  let readyAckCallback: MultiplayerReadyAckCallback = (
    playerNUmber: number
  ): void => {};

  export function checkConnection(): boolean {
    if (socket && !socket.needsToConnect()) return true;
    return connect();
  }

  export function connect(): boolean {
    if (socket && !socket.needsToConnect()) return true;

    const token = localStorage.getItem("token");

    const socketOptions: SocketParameters = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? { token } : {},
      path: "/multiplayer",
    };

    const endpoint: string = Config.ws_protocol + "://" + Config.host_ip + ":" + Config.api_port;

    socket = SocketManager.configureSocket(endpoint, socketOptions);

    socket.on("update-score", (scoreUpdate: ScoreUpdate) => {
      scoreUpdateCallback(scoreUpdate);
    });

    socket.on("game-start", (serveUpdate: ServeUpdate) => {
      gameStartedCallback(serveUpdate);
    });

    socket.on("update-movement", (movementUpdate: MovementUpdate) => {
      movementUpdateCallback(movementUpdate);
    });

    socket.on("update-ball", (ballUpdate: BallUpdate) => {
      ballUpdateCallback(ballUpdate);
    });

    socket.on("serve", (serveUpdate: ServeUpdate) => {
      serveCallback(serveUpdate);
    });

    socket.on("game-ended", () => {
      gameEndedCallback.forEach((callback) => callback());
    });

    socket.on("ready-ack", (playerNumber: number) => {
      readyAckCallback(playerNumber);
    });

    socket.on("unauthorized", () => {
      const token = localStorage.getItem("token");
      socket.emit("authorization", token ? { token } : {});
      SocketManager.fireSocketErrorCallback();
    });

    return true;
  }

  export function disconnect(): void {
    if (socket && socket.connected) socket.disconnect();
  }

  // Callback setup functions
  export function onScoreUpdate(
    callback: MultiplayerScoreUpdateCallback
  ): void {
    scoreUpdateCallback = callback;
  }

  export function onGameStarted(
    callback: MultiplayerGameStartedCallback
  ): void {
    gameStartedCallback = callback;
  }

  export function onGameEnded(callback: MultiplayerGameEndedCallback): void {
    gameEndedCallback.push(callback);
  }

  export function offGameEnded(callback: MultiplayerGameEndedCallback): void {
    gameEndedCallback = gameEndedCallback.filter((cb) => cb !== callback);
  }

  export function onMovementUpdate(
    callback: MultiplayerMovementUpdateCallback
  ) {
    movementUpdateCallback = callback;
  }

  export function onBallUpdate(callback: MultiplayerBallUpdateCallback): void {
    ballUpdateCallback = callback;
  }

  export function onServe(callback: MultiplayerServeCallback): void {
    serveCallback = callback;
  }

  export function onReadyAck(callback: MultiplayerReadyAckCallback): void {
    readyAckCallback = callback;
  }

  export function removeCallbacks(): void {
    gameStartedCallback = (serveUpdate: ServeUpdate): void => {};
    gameEndedCallback = [];
    movementUpdateCallback = (movementUpdate: MovementUpdate): void => {};
    ballUpdateCallback = (ballUpdate: BallUpdate): void => {};
    serveCallback = (serveUpdate: ServeUpdate): void => {};
    scoreUpdateCallback = (scoreUpdate: ScoreUpdate): void => {};
    readyAckCallback = (playerNUmber: number): void => {};
  }

  // Send functions
  export function sendMovementUpdate(movementUpdate: MovementUpdate): void {
    if (!checkConnection()) return;
    socket.emit("update-movement", movementUpdate);
  }

  export function sendBallUpdate(ballUpdate: BallUpdate): void {
    if (!checkConnection()) return;
    socket.emit("update-ball", ballUpdate);
  }

  export async function sendReady(): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

      const result = await socket.emitWithAck("ready");
      if (result !== "OK")
        throw new Error(result);
  }

  export function sendGoal(): void {
    if (!checkConnection()) return;
    socket.emit("goal");
  }

  export function quitGame() {
    if (!checkConnection()) return;
    socket.emit("quit");
  }
}
