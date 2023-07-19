import { io, Socket } from "socket.io-client";
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

export namespace MultiplayerClient {

  let socket: Socket;
  let gameStartedCallback: MultiplayerGameStartedCallback = (serveUpdate: ServeUpdate): void => {};
  let gameEndedCallback: MultiplayerGameEndedCallback = (): void => {};
  let movementUpdateCallback: MultiplayerMovementUpdateCallback = (movementUpdate: MovementUpdate): void => {};
  let ballUpdateCallback: MultiplayerBallUpdateCallback = (ballUpdate: BallUpdate): void => {};
  let serveCallback: MultiplayerServeCallback = (serveUpdate: ServeUpdate): void => {};
  let scoreUpdateCallback: MultiplayerScoreUpdateCallback = (scoreUpdate: ScoreUpdate): void => {};
  let readyAckCallback: MultiplayerReadyAckCallback = (playerNUmber: number): void => {};

  export function checkConnection(): boolean {

    if (socket && socket.connected)
      return true;

    console.log("connecting to multiplayer server");

    const token = localStorage.getItem("token");

    const socketOptions = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? {token} : {},
      path: '/multiplayer',
    };

    const endpoint: string = "ws://" + process.env["REACT_APP_HOST_IP"] + ":5400";

    socket = io(endpoint, socketOptions);

    socket.on("connect_error", (err) => {
      console.log('connexion error due to : ', err.message);
    });

    socket.on("connect", () => {
      console.log("connected to matchmaking server");
    });

    socket.on("disconnect", () => {
      console.log("disconnected from matchmaking server");
    });

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

  function disconnect(): void {
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
}