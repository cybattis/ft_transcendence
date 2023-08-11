import "./LeaderboardItem.css";
import { Avatar } from "../Avatar";
import { UserInfo } from "../../type/user.type";
import { Link } from "react-router-dom";
import { calculateWinrate } from "../../utils/calculateWinrate";
import {GameStatus, GameType} from "../../type/game.type";

export function LeaderboardItem(props: { rank: number; data: UserInfo }) {
  const winrate = calculateWinrate(props.data);

  return (
    <div className={"leaderboard-item"}>
      <div id={"pastille"}>{props.rank + 1}</div>
      <Link to={`/profile/id/${props.data.id}`} id={"LeaderboardProfileLink"}>
        <Avatar size={"40px"} img={props.data.avatarUrl} />
        <div id={"ldi-nickname"}>{props.data.nickname}</div>
      </Link>
      <div id={"ldi-winrate"}>{winrate.toFixed(0)}%</div>
      <div id={"ldi-game-played"}>{props.data.games?.filter(
        (game) => game.type === GameType.RANKED &&
          (game.status === GameStatus.FINISHED
            || game.status === GameStatus.PLAYER1_DISCONNECTED
            || game.status === GameStatus.PLAYER2_DISCONNECTED)).length}
      </div>
      <div id={"ldi-elo"}>{props.data.ranking}</div>
    </div>
  );
}
