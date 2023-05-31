import { GameStatsDto, GameType } from "../../../type/game.type";
import "./GameStatsItem.css";
import { Link } from "react-router-dom";

export function GameStatsHeader() {
  return (
    <div className={"gameStatHeader"}>
      <div id={"date"}>Date</div>
      <div id={"type"}>Type</div>
      <div id={"score"}>Score</div>
      <div id={"opponent"}>Opponent</div>
    </div>
  );
}

export function GameStatsItem(props: { game: GameStatsDto; id: number }) {
  const date = new Date(props.game.creationDate);
  function OpponentName() {
    let name: string;
    let opponentId: number;

    if (props.game.players[0].id === props.id) {
      name = props.game.players[1].nickname;
      opponentId = props.game.players[1].id;
    } else {
      name = props.game.players[0].nickname;
      opponentId = props.game.players[0].id;
    }
    return (
      <div id={"opponent"}>
        <Link to={`/profile/${opponentId}`} className={"opponentProfile"}>
          {name}
        </Link>
      </div>
    );
  }

  const formattedDate = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return (
    <div className={"gameStat"}>
      <div id={"date"}>{formattedDate}</div>
      <div id={"type"}>
        {props.game.type === GameType.RANKED ? "Ranked" : "Casual"}
      </div>
      <div id={"score"}>
        {(props.game.ids[0] == props.id &&
          props.game.scoreP1 > props.game.scoreP2) ||
        (props.game.ids[1] == props.id &&
          props.game.scoreP1 < props.game.scoreP2) ? (
          <div id={"win"}>
            {props.game.scoreP1}-{props.game.scoreP2}
          </div>
        ) : (
          <div id={"loose"}>
            {props.game.scoreP1}-{props.game.scoreP2}
          </div>
        )}
      </div>
      <OpponentName />
    </div>
  );
}
