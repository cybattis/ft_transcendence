import "./Leaderboard.css";
import { useLoaderData } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { UserInfo } from "../../type/user.type";

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
            <LeaderboardItem rank={index} data={item} />
          </div>
        ))}
    </div>
  );
}
