import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import ChatClient from "../Chat/Chat";
import jwt_decode from "jwt-decode";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserInfo } from "../../type/user.type";
import { Link, Navigate } from "react-router-dom";
import { GameStatsDto, GameType } from "../../type/game.type";
import { XPBar } from "../../components/XPBar/XPBar";
import { TokenData } from "../../type/user.type";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { MatcheScore } from "../../components/Game/MatcheScore";
import { Friends } from "../../components/Friends/Friends";
import { SocketContext } from "../../components/Auth/dto";
import {io} from 'socket.io-client';

let usernameChange = '';
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

function Result(props: { game: GameStatsDto; userId: number }) {
  const isWin =
    (props.game.players[0].id == props.userId &&
      props.game.scoreP1 > props.game.scoreP2) ||
    (props.game.ids[1] == props.userId &&
      props.game.scoreP1 < props.game.scoreP2);

  return (
    <div className={"gameResult"}>
      {isWin ? (
        <div>
          <div className={"win"}>Win</div>
          <MatcheScore game={props.game} userId={props.userId} />
        </div>
      ) : (
        <div>
          <div className={"loose"}>Loose</div>
          <MatcheScore game={props.game} userId={props.userId} />
        </div>
      )}
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
            <Result game={game} userId={props.data.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Winrate(props: { data: UserInfo }) {
  const winrate: number = calculateWinrate(props.data);

  return (
    <div className={"statsBox"}>
      <h5>Winrate</h5>
      <br />
      <div>{winrate.toFixed(0)}%</div>
    </div>
  );
}

function UserProfile() {
  const [data, setData] = useState<UserInfo>({
    id: 0,
    nickname: "",
    avatarUrl: "",
    level: 0,
    xp: 0,
    ranking: 0,
    games: [],
    friendsId: [],
    requestedId: [],
    blockedId: [],
    blockedById: [],
  });

  const decoded: TokenData | null = jwt_decode(
    localStorage.getItem("token")!
  ) as TokenData;

  useEffect(() => {
    async function fetchData(id: number) {
      await axios
        .get(`http://localhost:5400/user/profile/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setData(response.data);
        });
    }

    fetchData(decoded.id).then(() => {});
  }, []);

  if (decoded === null) {
    return <Navigate to="/" />;
  }

  return (
    <div className="user">
      <div className="infobox">
        <Avatar size="200px" img={data.avatarUrl} />
        <div className="info">
          <h5>{data.nickname}</h5>
          <p>LVL {data.level}</p>
          <p>{data.xp} xp</p>
          <XPBar xp={data.xp} lvl={data.level} />
        </div>
      </div>
      <div className="stats">
        <LastMatch data={data} />
        <Winrate data={data} />
        <div className={"statsBox"}>
          <h5>ELO</h5>
          <br />
          <div>{data.ranking}</div>
        </div>
      </div>
    </div>
  );
}

export function HomeLogged() {
  const { socketId, setSocketId } = useContext(SocketContext);
  
  setSocketId(io('http://localhost:5400').id);
  console.log(socketId);

  return (
    <div className={"home"}>
      <div className={"leftside"}>
        <GameLauncher />
        <UserProfile />
      </div>
      <div className="rightside">
        <ChatClient/>
        <Friends />
      </div>
    </div>
  );
}
