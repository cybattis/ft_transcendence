import "./Profile.css";
import axios from "axios";
import { Navigate, useLoaderData } from "react-router-dom";
import { UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
import { XPBar } from "../../components/XPBar/XPBar";
import {
  GameStatsHeader,
  GameStatsItem,
} from "../../components/Game/GameStats/GameStatsItem";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { GameStatsDto } from "../../type/game.type";
import jwt from "jwt-decode";

//Faire en sorte que si le mec ets en ligne -> websocket sinon mettre dans la base de donnee et faire au chargement

function AddFriend(data: any) {
  const handleButton = async () => {
    await axios.put(`http://localhost:5400/user/request/${data.id}`, data)
    .then((res) => {
      console.log(res);
    })
    .catch(error => {
      console.log(error);
    })
  }

  return <>
      <button className="friendButton" type="button" onClick={handleButton}>Add Friend</button>
  </>
}

export function Profile() {
  // TODO: check token validity

  let data = useLoaderData() as UserInfo;
  if (localStorage.getItem("token") === null) {
    return <Navigate to="/" />;
  }
  const winrate: number = calculateWinrate(data);

  const token: any = localStorage.getItem("token");
  const payload: any = jwt(token);

  let isMe: Boolean;

  if (payload.id === data.id.toString()) // Faire en sorte que le bouton ami apparaisse pas si ils sont amis
    isMe = true;
  else
    isMe = false;

  return (
    <div className={"profilePage"}>
      <div id={"infobox"}>
        <Avatar size="200px" img={data.avatarUrl} />
        <div id="info">
          <div id="header">
            <h1 id={"nickname"}>{data.nickname}</h1>
            {(isMe === false) ? <AddFriend data={data}/> : null}
          </div>
          <div>LVL {data.level}</div>
          <p>{data.xp} xp</p>
          <XPBar xp={data.xp} lvl={data.level} />
        </div>
      </div>
      <div id={"stats"}>
        <div id={"elo"} className={"dataBox"}>
          <div>ELO</div>
          <div>{data.ranking}</div>
        </div>
        <div id={"gamePlayed"} className={"dataBox"}>
          <div>Game played</div>
          <div>{data.games?.length}</div>
        </div>
        <div id={"winrate"} className={"dataBox"}>
          <div>Winrate</div>
          <div>{winrate}%</div>
        </div>
      </div>
      <div className={"gamesStatsBox"}>
        <h5 id={"gamesStatsBoxTitle"}>Matche history</h5>
        <hr id={"hrbar"} />
        <GameStatsHeader />
        <div className={"matchesTable"}>
          {data.games?.map((game: GameStatsDto, index) => (
            <div key={index}>
              <GameStatsItem game={game} id={data.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
