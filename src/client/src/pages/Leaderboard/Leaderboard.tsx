import "./Leaderboard.css";
import { Navigate, useLoaderData } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { UserInfo } from "../../type/user.type";
import { useContext } from "react";
import { AuthContext } from "../../components/Auth/dto";
import { ErrorContext } from "../../components/Modal/modalContext";

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
  const data = useLoaderData() as UserInfo[];
  const token = localStorage.getItem("token");
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

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
