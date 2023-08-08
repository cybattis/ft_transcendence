import { UserInfo } from "../type/user.type";
import {GameStatus, GameType} from "../type/game.type";

export function calculateWinrate(props: UserInfo): number  {
  const actualGame = props.games?.filter(
    (game) => game.type === GameType.RANKED &&
      (game.status === GameStatus.FINISHED || game.status === GameStatus.PLAYER_DISCONNECTED)
  ).length;

  return props.totalGameWon && actualGame
    ? (props.totalGameWon * 100) / actualGame
    : 0;
}
