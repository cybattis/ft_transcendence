import { io, Socket } from "socket.io-client";
import { MatchmakingMatchFoundCallback, MatchmakingGameStartedCallback } from "./types";

export namespace MatchmakingClient {

  let socket: Socket;
  let matchFoundCallbacks: MatchmakingMatchFoundCallback[] = [];
  let gameStartedCallbacks: MatchmakingGameStartedCallback[] = [];

  function checkConnection(): boolean {

    if (socket && socket.connected)
      return true;

    console.log("connecting to matchmaking server");

    const token = localStorage.getItem("token");

    const socketOptions = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? {token} : {},
      path: '/matchmaking',
    };

    const endpoint: string = "ws://" + process.env["REACT_APP_API_IP"] + ":5400";

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

    socket.on("match-found", (acceptTimeout: number) => {
      console.log("match found");
      matchFoundCallbacks.forEach(callback => callback(acceptTimeout));
    });

    socket.on("game-started", () => {
      console.log("game started");
      gameStartedCallbacks.forEach(callback => callback());
    });

    socket.on("unauthorized", () => {
      console.log("unauthorized");
      const token = localStorage.getItem("token");
      socket.emit("authorization", token ? {token} : {});
    });

    return true;
  }

  function disconnect() {
    if (socket && socket.connected)
      socket.disconnect();
  }

  export function leaveMatchmaking() {
    leaveMatchmakingRanked();
    leaveMatchmakingCasual();
  }

  export function joinMatchmakingCasual() {
    if (!checkConnection()) return;
    socket.emit("join-matchmaking-casual");
  }

  export function leaveMatchmakingCasual() {
    if (!checkConnection()) return;
    socket.emit("leave-matchmaking-casual");
  }

  export function joinMatchmakingRanked() {
    if (!checkConnection()) return;
    socket.emit("join-matchmaking-ranked");
  }

  export function leaveMatchmakingRanked() {
    if (!checkConnection()) return;
    socket.emit("leave-matchmaking-ranked");
  }

  export function joinFoundMatch() {
    if (!checkConnection()) return;
    socket.emit("accept-found-game");
  }

  export function onMatchFound(callback: MatchmakingMatchFoundCallback) {
    matchFoundCallbacks.push(callback);
  }

  export function offMatchFound(callback: MatchmakingMatchFoundCallback) {
    matchFoundCallbacks = matchFoundCallbacks.filter(cb => cb !== callback);
  }

  export function ongameStarted(callback: MatchmakingGameStartedCallback) {
    gameStartedCallbacks.push(callback);
  }

  export function offgameStarted(callback: MatchmakingGameStartedCallback) {
    gameStartedCallbacks = gameStartedCallbacks.filter(cb => cb !== callback);
  }

}
