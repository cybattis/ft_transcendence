import "./Leaderboard.css";
import { useLoaderData } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { LeaderboardItemProps } from "../../type/client.type";

function TableHeader() {
  return (
    <div className={"tableHeader"}>
      <div>Rank</div>
      <div>Player</div>
      <div>Winrate</div>
      <div>Game played</div>
      <div>ELO</div>
    </div>
  );
}

export function Leaderboard() {
  let data = useLoaderData();
  const fakeData: LeaderboardItemProps[] = [
    {
      rank: 1,
      nickname: "test",
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      winrate: 60,
      gamePlayed: 20,
      elo: 1050,
    },
    {
      rank: 2,
      nickname: "test2",
      avatar: "https://www.w3schools.com/howto/img_avatar.png",
      winrate: 45,
      gamePlayed: 25,
      elo: 880,
    },
  ];

  return (
    <div className={"Leaderboard"}>
      <h5 id={"title"}>Leaderboard</h5>
      <TableHeader />
      {fakeData.map((item, index) => (
        <div key={index}>
          <LeaderboardItem data={fakeData[index]} />
        </div>
      ))}
    </div>
  );
}
