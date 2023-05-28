import "./LeaderboardItem.css";
import { Avatar } from "../Avatar";
import { LeaderboardItemProps } from "../../type/client.type";

export function LeaderboardItem(props: { data: LeaderboardItemProps }) {
  return (
    <div className={"leaderboardItem"}>
      <div>{props.data.rank}</div>
      <Avatar size={"20px"} img={props.data.avatar} />
      <div>{props.data.nickname}</div>
      <div>{props.data.winrate}</div>
      <div>{props.data.gamePlayed}</div>
      <div>{props.data.elo}</div>
    </div>
  );
}
