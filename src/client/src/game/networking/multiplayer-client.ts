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
  ScoreUpdate, ServeUpdate
} from "./types";
import { SocketManager } from "../../utils/socketManager";

export namespace MultiplayerClient {

  import SocketParameters = SocketManager.SocketParameters;
  import ManagedSocket = SocketManager.ManagedSocket;
  let socket: ManagedSocket;
  let gameStartedCallback: MultiplayerGameStartedCallback = (serveUpdate: ServeUpdate): void => {};
  let gameEndedCallback: MultiplayerGameEndedCallback = (): void => {};
  let movementUpdateCallback: MultiplayerMovementUpdateCallback = (movementUpdate: MovementUpdate): void => {};
  let ballUpdateCallback: MultiplayerBallUpdateCallback = (ballUpdate: BallUpdate): void => {};
  let serveCallback: MultiplayerServeCallback = (serveUpdate: ServeUpdate): void => {};
  let scoreUpdateCallback: MultiplayerScoreUpdateCallback = (scoreUpdate: ScoreUpdate): void => {};
  let readyAckCallback: MultiplayerReadyAckCallback = (playerNUmber: number): void => {};

  export function checkConnection(): boolean {
    if (socket && !socket.needsToConnect()) return true;
    return connect();
  }

  export function connect(): boolean {
    if (socket && !socket.needsToConnect()) return true;

    console.log("connecting to multiplayer server");

    const token = localStorage.getItem("token");

    const socketOptions: SocketParameters = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? {token} : {},
      path: '/multiplayer',
    };

    const endpoint: string = "ws://" + process.env["REACT_APP_HOST_IP"] + ":5400";

    socket = SocketManager.configureSocket(endpoint, socketOptions);

    socket.on("update-score", (scoreUpdate: ScoreUpdate) => {
      console.log("update-score");
      scoreUpdateCallback(scoreUpdate);
    });

    socket.on("game-start", (serveUpdate: ServeUpdate) => {
      console.log("game started");
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
      console.log("game ended");
      gameEndedCallback();
    });

    socket.on("ready-ack", (playerNumber: number) => {
      console.log("ready ack");
      readyAckCallback(playerNumber);
    });

    socket.on("unauthorized", () => {
      console.log("unauthorized");
      const token = localStorage.getItem("token");
      socket.emit("authorization", token ? {token} : {});
    });

    return true;
  }

  export function disconnect(): void {
    if (socket && socket.connected)
      socket.disconnect();
  }

  // Callback setup functions
  export function onScoreUpdate(callback: MultiplayerScoreUpdateCallback): void {
    scoreUpdateCallback = callback;
  }

  export function onGameStarted(callback: MultiplayerGameStartedCallback): void {
    gameStartedCallback = callback;
  }

  export function onGameEnded(callback: MultiplayerGameEndedCallback): void {
    gameEndedCallback = callback;
  }

  export function onMovementUpdate(callback: MultiplayerMovementUpdateCallback) {
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
    gameEndedCallback = (): void => {};
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

  export function sendReady(): void {
    if (!checkConnection()) return;
    socket.emit("ready");
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