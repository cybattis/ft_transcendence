import { GameStats, GameStatus } from "../../type/game.type";
import "./GameStatsItem.css";

export function MatcheScore(props: { game: GameStats; userId: number }) {
  const score = () => {
    if (props.game.ids[0] === props.userId) {
      return (
        <div>
          {props.game.scoreP1}-{props.game.scoreP2}
        </div>
      );
    } else {
      return (
        <div>
          {props.game.scoreP2}-{props.game.scoreP1}
        </div>
      );
    }
  };

  const state = () => {
    if (props.game.status === GameStatus.IN_PROGRESS)
      return <div id={"md-in-progress"}>In progress</div>;
    else if (
      (props.game.ids[0] == props.userId &&
        props.game.scoreP1 > props.game.scoreP2) ||
      (props.game.ids[1] == props.userId &&
        props.game.scoreP1 < props.game.scoreP2)
    ) {
      return <div id={"md-win"}>{score()}</div>;
    } else return <div id={"md-loose"}>{score()}</div>;
  };

  return <div id={"md-score"}>{state()}</div>;
}
