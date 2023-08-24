import { MultiplayerClient } from "../game/networking/multiplayer-client";
import { removeMultiplayerGame } from "../game/PongManager";
import { MatchmakingClient } from "../game/networking/matchmaking-client";
import { MatchmakingState } from "./matchmaking-states";
import { MatchmakingPlayerStatus } from "../game/networking/types";
import { ChatClientSocket } from "../pages/Chat/Chat-client";
import { Fetching } from "./fetching";

export namespace Navigation {
  import put = Fetching.put;
  let pageChangeCallbacks: (() => void)[] = [];

  export function onPageChange(callback: () => void) {
    pageChangeCallbacks.push(callback);
  }

  export function offPageChange(callback: () => void) {
    pageChangeCallbacks = pageChangeCallbacks.filter(cb => cb !== callback);
  }

  export async function handlePageChange(): Promise<void> {
    pageChangeCallbacks.forEach(cb => cb());
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
  }

  export function disconnect(): void {
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
    MatchmakingState.setMatchmakingState({status: MatchmakingPlayerStatus.NONE});
    ChatClientSocket.disconnect();
    MultiplayerClient.disconnect();
    MatchmakingClient.disconnect();
    localStorage.clear();
  }

}
