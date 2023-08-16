import {
  MatchmakingMatchFoundCallback,
  MatchmakingGameStartedCallback,
  PlayerInfos,
} from "./types";
import { SocketManager } from "../../utils/socketManager";
import Config from "../../utils/Config";

export namespace MatchmakingClient {
  import ManagedSocket = SocketManager.ManagedSocket;
  let socket: ManagedSocket;
  let matchFoundCallbacks: MatchmakingMatchFoundCallback[] = [];
  let gameStartedCallbacks: MatchmakingGameStartedCallback[] = [];
  let gameInviteAcceptedCallbacks: MatchmakingGameStartedCallback[] = [];
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

    const endpoint: string = "ws://" + Config.host_ip + ":" + Config.api_port;

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

    socket.on("game-invite-accepted", () => {
      console.log("game invite accepted");
      gameInviteAcceptedCallbacks.forEach((callback) => callback());
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

  export async function leaveMatchmaking(): Promise<void> {
    await leaveMatchmakingRanked();
    await leaveMatchmakingCasual();
  }

  export async function joinMatchmakingCasual(): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("join-matchmaking-casual");
    if (result !== "OK")
      throw new Error(result);
  }

  export async function leaveMatchmakingCasual(): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("leave-matchmaking-casual");

    if (result !== "OK")
      throw new Error(result);}

  export async function joinMatchmakingRanked(): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("join-matchmaking-ranked");
    if (result !== "OK")
      throw new Error(result);
  }

  export async function leaveMatchmakingRanked(): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("leave-matchmaking-ranked");
    if (result !== "OK")
      throw new Error(result);
  }

  export async function joinFoundMatch(): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("accept-found-game");
    if (result !== "OK")
      throw new Error(result);
  }

  export async function inviteUserToCasualGame(userId: number): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("invite-user-to-casual-game", {userId: userId});
    if (result !== "OK")
      throw new Error(result);
  }

  export async function inviteUserToRankedGame(userId: number): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("invite-user-to-ranked-game", {userId: userId});
    if (result !== "OK")
      throw new Error(result);
  }

  export async function acceptInviteToCasualGame(userId: number): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("accept-invite-to-casual-game", {userId: userId});
    if (result !== "OK")
      throw new Error(result);
  }

  export async function acceptInviteToRankedGame(userId: number): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("accept-invite-to-ranked-game", {userId: userId});
    if (result !== "OK")
      throw new Error(result);
  }

  export async function declineInviteToCasualGame(userId: number): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("decline-invite-to-casual-game", {userId: userId});
    if (result !== "OK")
      throw new Error(result);
  }

  export async function declineInviteToRankedGame(userId: number): Promise<void> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    const result: string = await socket.emitWithAck("decline-invite-to-ranked-game", {userId: userId});
    if (result !== "OK")
      throw new Error(result);
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

  export function ongameInviteAccepted(callback: MatchmakingGameStartedCallback) {
    gameInviteAcceptedCallbacks.push(callback);
  }

  export function offgameInviteAccepted(callback: MatchmakingGameStartedCallback) {
    gameInviteAcceptedCallbacks = gameInviteAcceptedCallbacks.filter((cb) => cb !== callback);
  }
}
