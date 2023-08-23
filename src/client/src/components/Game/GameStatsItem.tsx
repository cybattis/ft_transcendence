import { GameStats, GameType } from "../../type/game.type";
import "./GameStatsItem.css";
import { Link } from "react-router-dom";
import { Avatar } from "../Avatar";
import { MatcheScore } from "./MatcheScore";
import { useData } from "../../hooks/UseData";
import { UserInfo } from "../../type/user.type";

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

export function GameStatsItem(props: {game: GameStats, id: number}) {
  const player1 = useData<UserInfo>(`user/profile/id/${props.game.ids[0]}`);
  const player2 = useData<UserInfo>(`user/profile/id/${props.game.ids[1]}`);

  if (player1.data && player2.data)
    return <GameStatsItemLoaded game={props.game} id={props.id} player1={player1.data} player2={player2.data} />;
  else if (player1.error || player2.error)
    return <div>error</div>;
  else
    return <div>loading</div>;
}

function GameStatsItemLoaded(props: { game: GameStats; id: number; player1: UserInfo; player2: UserInfo}) {
  const date = new Date(props.game.creationDate);

  function OpponentName() {
    let name: string;
    let opponentAvatar: string | undefined;
    if (props.game.ids[0] === props.id) {
      name = props.player2.nickname;
      opponentAvatar = props.player2.avatarUrl;
    } else {
      name = props.player1.nickname;
      opponentAvatar = props.player1.avatarUrl;
    }

    return (
      <Link to={`/profile/nickname/${name}`} className={"opponent-profile"}>
        <div id={"opponent-name"}>
          <Avatar size={"30px"} img={opponentAvatar}/>
          <div id={"gi-name"}>{name}</div>
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
