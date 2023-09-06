import {
  MatchmakingSyncCallback,
  MatchmakingGameStartedCallback,
  PlayerInfos, MatchmakingPlayerStatusDTO,
  MatchmakingGameInviteAcceptedCallback,
} from "./types";
import { SocketManager } from "../../utils/socketManager";
import Config from "../../utils/Config";
import { wsBaseURL } from "../../utils/constant";

export namespace MatchmakingClient {
  import ManagedSocket = SocketManager.ManagedSocket;
  let socket: ManagedSocket;
  let syncCallbacks: MatchmakingSyncCallback[] = [];
  let gameStartedCallbacks: MatchmakingGameStartedCallback[] = [];
  let gameInviteAcceptedCallbacks: MatchmakingGameInviteAcceptedCallback[] = [];
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

    const token = localStorage.getItem("token");

    const socketOptions = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? { token } : {},
      path: "/matchmaking",
    };

    socket = SocketManager.configureSocket(wsBaseURL, socketOptions);

    socket.on("sync", (status: MatchmakingPlayerStatusDTO) => {
      syncCallbacks.forEach((callback) => callback(status));
    });

    socket.on("game-started", (opponentInfos: PlayerInfos) => {
      currentOpponentInfos = opponentInfos;
      gameStartedCallbacks.forEach((callback) => callback(false));
    });

    socket.on("game-started-invite", (opponentInfos: PlayerInfos) => {
      currentOpponentInfos = opponentInfos;
      gameStartedCallbacks.forEach((callback) => callback(true));
    });

    socket.on("game-invite-accepted", () => {
      gameInviteAcceptedCallbacks.forEach((callback) => callback());
    });

    socket.on("unauthorized", () => {
      const token = localStorage.getItem("token");
      socket.emit("authorization", token ? { token } : {});
      SocketManager.fireSocketErrorCallback();
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
      throw new Error(result);
  }

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

  export async function getMatchmakingStatus(): Promise<MatchmakingPlayerStatusDTO> {
    if (!checkConnection())
      throw new Error("Connection to matchmaking server failed");

    return await socket.emitWithAck("get-status");

  }

  export function onSync(callback: MatchmakingSyncCallback) {
    syncCallbacks.push(callback);
  }

  export function offSync(callback: MatchmakingSyncCallback) {
    syncCallbacks = syncCallbacks.filter((cb) => cb !== callback);
  }

  export function onGameStarted(callback: MatchmakingGameStartedCallback) {
    gameStartedCallbacks.push(callback);
  }

  export function offGameStarted(callback: MatchmakingGameStartedCallback) {
    gameStartedCallbacks = gameStartedCallbacks.filter((cb) => cb !== callback);
  }

  export function ongameInviteAccepted(callback: MatchmakingGameInviteAcceptedCallback) {
    gameInviteAcceptedCallbacks.push(callback);
  }

  export function offgameInviteAccepted(callback: MatchmakingGameInviteAcceptedCallback) {
    gameInviteAcceptedCallbacks = gameInviteAcceptedCallbacks.filter((cb) => cb !== callback);
  }
}
