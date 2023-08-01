import "./Leaderboard.css";
import { Navigate, useLoaderData } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { UserInfo } from "../../type/user.type";
import { useContext } from "react";
import { AuthContext } from "../../components/Auth/dto";
import { PopupContext } from "../../components/Modal/Popup.context";

function TableHeader() {
  return (
    <div className={"table-header"}>
      <div id={"ld-rank"}>#</div>
      <div id={"ld-player"}>Player</div>
      <div id={"ld-winrate"}>Winrate</div>
      <div id={"ld-game-played"}>Matches</div>
      <div id={"ld-elo"}>ELO</div>
    </div>
  );
}

export function Leaderboard() {
  const data = useLoaderData() as UserInfo[];
  const token = localStorage.getItem("token");
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(PopupContext);

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

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
