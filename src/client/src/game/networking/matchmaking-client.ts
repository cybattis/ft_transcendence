import {
  MatchmakingMatchFoundCallback,
  MatchmakingGameStartedCallback, PlayerInfos,
} from "./types";
import { SocketManager } from "../../utils/socketManager";

export namespace MatchmakingClient {
  import ManagedSocket = SocketManager.ManagedSocket;
  let socket: ManagedSocket;
  let matchFoundCallbacks: MatchmakingMatchFoundCallback[] = [];
  let gameStartedCallbacks: MatchmakingGameStartedCallback[] = [];
  let currentOpponentInfos: PlayerInfos = {
    id: 0,
    nickname: "",
    paddleColor: "ffffff",
  };

  export function checkConnection(): boolean {
    if (socket && !socket.needsToConnect()) return true;
    return connect();
  }

  export function connect(): boolean {
    if (socket && !socket.needsToConnect()) return true;

    console.log("connecting to matchmaking server");

    const token = localStorage.getItem("token");

    const socketOptions = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? { token } : {},
      path: "/matchmaking",
    };

    const endpoint: string =
      "ws://" + process.env["REACT_APP_HOST_IP"] + ":5400";

    socket = SocketManager.configureSocket(endpoint, socketOptions);

    socket.on("match-found", (acceptTimeout: number) => {
      console.log("match found");
      matchFoundCallbacks.forEach((callback) => callback(acceptTimeout));
    });

    socket.on("game-started", (opponentInfos: PlayerInfos) => {
      console.log("game started", opponentInfos);
      currentOpponentInfos = opponentInfos;
      gameStartedCallbacks.forEach((callback) => callback());
    });

    socket.on("unauthorized", () => {
      console.log("unauthorized");
      const token = localStorage.getItem("token");
      socket.emit("authorization", token ? { token } : {});
    });

    return true;
  }

  export function disconnect() {
    if (socket && socket.isConnected) socket.disconnect();
  }

  export function getOpponentInfos(): PlayerInfos {
    return currentOpponentInfos;
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
    matchFoundCallbacks = matchFoundCallbacks.filter((cb) => cb !== callback);
  }

  export function ongameStarted(callback: MatchmakingGameStartedCallback) {
    gameStartedCallbacks.push(callback);
  }

  export function offgameStarted(callback: MatchmakingGameStartedCallback) {
    gameStartedCallbacks = gameStartedCallbacks.filter((cb) => cb !== callback);
  }
}
