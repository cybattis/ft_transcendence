import "./Leaderboard.css";
import { Navigate } from "react-router-dom";
import { LeaderboardItem } from "../../components/Leaderboard/LeaderboardItem";
import { UserInfo } from "../../type/user.type";
import { useContext } from "react";
import { AuthContext } from "../../components/Auth/auth.context";
import { useData } from "../../hooks/UseData";
import { LoadingPage } from "../Loading/LoadingPage";
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

export function LeaderboardLoader() {
  const { data } = useData<UserInfo[] | null>("user/leaderboard", true);

  return data ? <Leaderboard data={data}/> : <LoadingPage/>;
}

export function Leaderboard(props: { data: UserInfo[] }) {
  const token = localStorage.getItem("token");
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(PopupContext);

  if (token === null) {
    setAuthed(false);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  return (
    <div className={"leaderboard"}>
      <h5 id={"title"}>Leaderboard</h5>
      <TableHeader />
      {props.data &&
        props.data.map((item, index) => (
          <div key={index}>
            <LeaderboardItem rank={index} data={item} />
          </div>
        ))}
    </div>
  );
}
