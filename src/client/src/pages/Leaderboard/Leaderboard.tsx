import "./Leaderboard.css";
import { useLoaderData } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { UserInfo } from "../../type/user.type";
import { GameBodyDto } from "../../type/game.type";

function TableHeader() {
  return (
    <div className={"tableHeader"}>
      <div id={"tableLeft"}>
        <div>Player</div>
      </div>
      <div id={"tableRight"}>
        <div>Winrate</div>
        <div>Game played</div>
        <div>ELO</div>
      </div>
    </div>
  );
}

export interface LeaderboardProps {
  nickname: string;
  avatar: string;
  games: GameBodyDto[];
  totalGameWon: number;
  elo: number;
}

export function Leaderboard() {
  let data = useLoaderData() as UserInfo[];
  console.log("Leaderboard: ", data);

  return (
    <div className={"leaderboard"}>
      <h5 id={"title"}>Leaderboard</h5>
      <TableHeader />
      {data &&
        data.map((item, index) => (
          <div key={index}>
            {item.games && item.games?.length > 0 ? (
              <LeaderboardItem rank={index} data={data[index]} />
            ) : null}
          </div>
        ))}
    </div>
  );
}
