import "./LeaderboardItem.css";
import { Avatar } from "../Avatar";
import { UserInfo } from "../../type/user.type";
import { Link } from "react-router-dom";

export function LeaderboardItem(props: { rank: number; data: UserInfo }) {
  const winrate: number =
    props.data.games && props.data.totalGameWon && props.data.games?.length
      ? (props.data.totalGameWon * 100) / props.data.games?.length
      : 0;

  return (
    <div className={"leaderboard-item"}>
      <div id={"pastille"}>{props.rank + 1}</div>
      <Link to={`/profile/${props.data.id}`} id={"LeaderboardProfileLink"}>
        <Avatar size={"40px"} img={props.data.avatarUrl} />
        <div id={"ldi-nickname"}>{props.data.nickname}</div>
      </Link>
      <div id={"ldi-winrate"}>{winrate.toFixed(0)}%</div>
      <div id={"ldi-game-played"}>{props.data.games?.length}</div>
      <div id={"ldi-elo"}>{props.data.ranking}</div>
    </div>
  );
}
