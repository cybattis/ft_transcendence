import { MatchmakingPlayerStatusDTO } from "../game/networking/types";


export namespace MatchmakingState
{
  let callbacks: ((state: MatchmakingPlayerStatusDTO) => void)[] = [];

  export function onMatchmakingStateChange(callback: (state: MatchmakingPlayerStatusDTO) => void) {
    callbacks.push(callback);
  }

  export function offMatchmakingStateChange(callback: (state: MatchmakingPlayerStatusDTO) => void) {
    callbacks = callbacks.filter(cb => cb !== callback);
  }

  export function setMatchmakingState(state: MatchmakingPlayerStatusDTO) {
    callbacks.forEach(cb => cb(state));
  }
}
