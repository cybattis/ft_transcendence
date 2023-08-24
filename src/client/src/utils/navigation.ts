import { MultiplayerClient } from "../game/networking/multiplayer-client";
import { removeMultiplayerGame } from "../game/PongManager";
import { MatchmakingClient } from "../game/networking/matchmaking-client";

export namespace Navigation {
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

}
