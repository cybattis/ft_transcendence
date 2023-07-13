import { GameStatsDto, GameType } from "../../type/game.type";
import "./GameStatsItem.css";
import { Link } from "react-router-dom";
import { Avatar } from "../Avatar";
import { MatcheScore } from "./MatcheScore";

export function GameStatsHeader() {
  return (
    <div className={"match-data-header"}>
      <div id={"md-header-date"}>Date</div>
      <div id={"md-header-type"}>Type</div>
      <div id={"md-header-score"}>Score</div>
      <div id={"md-header-opponent"}>Opponent</div>
    </div>
  );
}

export function GameStatsItem(props: { game: GameStatsDto; id: number }) {
  const date = new Date(props.game.creationDate);
  function OpponentName() {
    let name: string;
    let opponentId: number;
    let opponentAvatar: string | undefined;

    if (props.game.players[0].id === props.id) {
      name = props.game.players[1].nickname;
      opponentId = props.game.players[1].id;
      opponentAvatar = props.game.players[1].avatarUrl;
    } else {
      name = props.game.players[0].nickname;
      opponentId = props.game.players[0].id;
      opponentAvatar = props.game.players[0].avatarUrl;
    }

    return (
      <Link to={`/profile/${name}`} className={"opponent-profile"}>
        <div id={"opponent-name"}>
          <Avatar size={"30px"} img={opponentAvatar} />
          {name}
        </div>
      </Link>
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
    <div className={"match-data"}>
      <div id={"md-date"}>{formattedDate}</div>
      <div id={"md-type"}>
        {props.game.type === GameType.RANKED ? "Ranked" : "Casual"}
      </div>
      <MatcheScore game={props.game} userId={props.id} />
      <OpponentName />
    </div>
  );
}
