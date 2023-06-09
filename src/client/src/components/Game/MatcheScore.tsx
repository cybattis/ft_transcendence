import { GameStatsDto } from "../../type/game.type";

export function MatcheScore(props: { game: GameStatsDto; userId: number }) {
  if (props.game.players[0].id == props.userId) {
    return (
      <div>
        {props.game.scoreP1}-{props.game.scoreP2}
      </div>
    );
  }
  return (
    <div>
      {props.game.scoreP2}-{props.game.scoreP1}
    </div>
  );
}
