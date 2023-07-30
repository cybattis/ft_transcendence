import "./Leaderboard.css";
import { Navigate, useLoaderData } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { UserInfo } from "../../type/user.type";
import { useContext } from "react";
import { ErrorContext } from "../../components/Modal/modalContext";
import {AuthContext} from "../../components/Auth/auth.context";

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
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  if (token === null) {
    setAuthed(false);
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
