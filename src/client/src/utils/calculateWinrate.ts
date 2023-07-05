import { UserInfo } from "../type/user.type";
import { GameStatus } from "../type/game.type";

export function calculateWinrate(props: UserInfo) {
  const actualGame = props.games?.filter(
    (game) => game.status === GameStatus.FINISHED
  ).length;

  return props.totalGameWon && actualGame
    ? (props.totalGameWon * 100) / actualGame
    : 0;
}
