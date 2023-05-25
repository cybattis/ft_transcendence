import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import { Chat } from "../../components/Chat/Chat";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserInfo } from "../../type/user.type";
import { Link } from "react-router-dom";
import { GameBodyDto, GameType } from "../../type/game.type";

function GameMode(props: { name: string; gameType: GameType }) {
  const content = {
    display: "flex",
    flexDirection: "column" as "column",
    width: "100%",
    boxSizing: "border-box" as "border-box",

    alignItems: "center",
    justifyContent: "center",

    margin: "10px",
  };

  return (
    <div style={content}>
      <h5>{props.name}</h5>
      <Link to="game" state={{ type: props.gameType }} className="gamemode" />
    </div>
  );
}

function GameLauncher() {
  return (
    <div className="launcher">
      <h4>Game mode</h4>
      <div className="buttons">
        <GameMode name="Practice" gameType={GameType.PRACTICE} />
        <GameMode name="Casual " gameType={GameType.CASUAL} />
        <GameMode name="Ranked" gameType={GameType.RANKED} />
      </div>
    </div>
  );
}

interface Decoded {
  id: string;
}

function Result(props: { game: GameBodyDto; data: UserInfo }) {
  return (
    <div className={"gameResult"}>
      <div>
        {(props.game.ids[0] == props.data.id &&
          props.game.scoreP1 > props.game.scoreP2) ||
        (props.game.ids[1] == props.data.id &&
          props.game.scoreP1 < props.game.scoreP2) ? (
          <div className={"win"}>Win</div>
        ) : (
          <div className={"loose"}>Loose</div>
        )}
      </div>
      <div>
        {props.game.scoreP1}-{props.game.scoreP2}
      </div>
    </div>
  );
}

function LastMatch(props: { data: UserInfo }) {
  return (
    <div className={"statsBox"}>
      <h5>Last matches</h5>
      <div className={"lastmatch"}>
        {props.data.games?.slice(-5).map((game, index) => (
          <div key={index}>
            <Result game={game} data={props.data} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Winrate(props: { data: UserInfo }) {
  const winrate: number =
    props.data.totalGameWon && props.data.games?.length
      ? (props.data.totalGameWon * 100) / props.data.games?.length
      : 0;

  return (
    <div>
      <h5>Winrate</h5>
      <div>{winrate.toFixed(0)}%</div>
    </div>
  );
}

function UserProfile() {
  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    console.log(e);
  }

  const [data, setData] = useState<UserInfo>({
    id: 0,
    nickname: "",
    level: 0,
    xp: 0,
    ranking: 0,
    games: [],
  });

  useEffect(() => {
    console.log(decoded);
    async function fetchData(id: string) {
      await axios
        .get(`http://localhost:5400/user/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setData(response.data);

          console.log(response.data);
        });
    }

    if (decoded !== null) fetchData(decoded.id).then((r) => console.log(r));
  }, []);

  return (
    <div className="user">
      <div className="infobox">
        <Avatar size="20%" img={data.avatar} />
        <div className="info">
          <h5>{data.nickname}</h5>
          <p>LVL {data.level}</p>
          <p>{data.xp} xp</p>
          <div id="progressbar">
            <div></div>
          </div>
        </div>
      </div>
      <div className="stats">
        <LastMatch data={data} />
        <Winrate data={data} />
        <div>
          <h5>ELO</h5>
          <div>{data.ranking}</div>
        </div>
      </div>
    </div>
  );
}

export function HomeLogged() {
  return (
    <div className={"home"}>
      <div className={"leftside"}>
        <GameLauncher />
        <UserProfile />
      </div>
      <Chat />
    </div>
  );
}
