import React, { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css";
import axios from "axios";
import { io } from "socket.io-client";
import { useLoaderData } from "react-router-dom";
import { UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
import { XPBar } from "../../components/XPBar/XPBar";
import {
  GameStatsHeader,
  GameStatsItem,
} from "../../components/Game/GameStats/GameStatsItem";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { GameStatsDto } from "../../type/game.type";
import { AuthContext } from "../../components/Auth/dto";
import Home from "../Home/Home";
import jwt_decode from "jwt-decode";

function RemoveFriend(data: any) {
  const [isMe, setIsMe] = useState(false);

  const token: any = localStorage.getItem("token");
  const payload: any = jwt_decode(token);

  useEffect(() => {
    if (payload.id === data.data.id.toString()) setIsMe(true);
  }, [data.data.id, payload.id]);

  const handleRemoveButton = async () => {
    await axios
      .put(`http://localhost:5400/user/remove/${data.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBlockButton = async () => {
    await axios
      .put(`http://localhost:5400/user/block/${data.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //Si jamais la target refresh sa page et pas nous notifs pas envoye
  if (!isMe && !data.data.blockedId.includes(parseInt(payload.id))) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleRemoveButton}
        >
          Remove Friend
        </button>
        <button
          className="friendButton"
          type="button"
          onClick={handleBlockButton}
        >
          Block Friend
        </button>
      </>
    );
  }
  return <></>;
}

// TODO: ?
function isBlocked(blockList: any, id: number) {
  for (let i = 0; blockList[i]; i++) {
    if (blockList[i] == id) return true;
  }
  return false;
}

function AddFriend(data: any) {
  const socketRef = useRef<any>(null);
  const [isMe, setIsMe] = useState(false);

  const token: any = localStorage.getItem("token");
  const payload: any = jwt_decode(token);

  useEffect(() => {
    if (payload.id === data.data.id || payload.id === data.data.id.toString())
      setIsMe(true);
    socketRef.current = io("http://localhost:5400");
  }, [payload.id, data.data.id]);

  const handleButton = async () => {
    await axios
      .put(`http://localhost:5400/user/request/${data.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const name: string = payload.username;
        const mess = { friend: data, from: name };
        socketRef.current.emit("friendRequest", mess);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleUnblockButton = async () => {
    await axios
      .put(`http://localhost:5400/user/unblock/${data.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (
    !isMe &&
    !data.data.requestedId.includes(parseInt(payload.id)) &&
    !data.data.blockedById.includes(parseInt(payload.id))
  ) {
    return (
      <>
        <button className="friendButton" type="button" onClick={handleButton}>
          Add Friend
        </button>
      </>
    );
  } else if (data.data.blockedById.includes(parseInt(payload.id))) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleUnblockButton}
        >
          Unblock
        </button>
      </>
    );
  }
  return <></>;
}

export function Profile() {
  let data = useLoaderData() as UserInfo;
  const { setAuthToken } = useContext(AuthContext);
  const [isFriend, setIsFriend] = useState(false);

  const token: any = localStorage.getItem("token");
  const payload: any = jwt_decode(token);

  useEffect(() => {
    if (data.friendsId.includes(parseInt(payload.id))) setIsFriend(true);
  }, [data.friendsId, payload.id]);

  if (token === null) {
    setAuthToken(null);
    return <Home />;
  }

  const winrate: number = calculateWinrate(data);

  if (data.blockedId.includes(parseInt(payload.id))) {
    return (
      <div className="blocked">
        <h3>
          This User Blocked you. You canno't visit his profilePage anymore.
        </h3>
      </div>
    );
  }

  return (
    <div className={"profilePage"}>
      <div id={"infobox"}>
        <Avatar size="200px" img={data.avatarUrl} />
        <div id="info">
          <div id="header">
            <h1 id={"nickname"}>{data.nickname}</h1>
            {!isFriend ? (
              <AddFriend data={data} />
            ) : (
              <RemoveFriend data={data} />
            )}
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
              <GameStatsItem game={game} id={data!.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
