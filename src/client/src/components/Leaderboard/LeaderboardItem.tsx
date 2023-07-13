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
    <div className={"ldi-container"}>
      <div className={"leaderboardItem"}>
        <div id={"ldi-leftSide"}>
          <div id={"pastille"}>{props.rank + 1}</div>
          <Link to={`/profile/${props.data.nickname}`} id={"LeaderboardProfileLink"}>
            <Avatar size={"40px"} img={props.data.avatarUrl} />
            <div>{props.data.nickname}</div>
          </Link>
        </div>
        <div id={"ldi-rightSide"}>
          <div id={"ldi-winrate"}>{winrate.toFixed(0)}%</div>
          <div id={"ldi-game-played"}>{props.data.games?.length}</div>
          <div id={"ldi-elo"}>{props.data.ranking}</div>
        </div>
      </div>
    </div>
  );
}
