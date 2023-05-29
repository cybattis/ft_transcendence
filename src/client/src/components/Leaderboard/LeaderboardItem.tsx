import "./LeaderboardItem.css";
import { Avatar } from "../Avatar";
import { UserInfo } from "../../type/user.type";

export function LeaderboardItem(props: { rank: number; data: UserInfo }) {
  const winrate: number =
    props.data.games && props.data.totalGameWon && props.data.games?.length
      ? (props.data.totalGameWon * 100) / props.data.games?.length
      : 0;

  return (
    <div className={"leaderboardItem"}>
      <div>{props.rank + 1}</div>
      <Avatar size={"20px"} img={props.data.avatarUrl} />
      <div>{props.data.nickname}</div>
      <div>{winrate.toFixed(0)}%</div>
      <div>{props.data.games?.length}</div>
      <div>{props.data.ranking}</div>
    </div>
  );
}
