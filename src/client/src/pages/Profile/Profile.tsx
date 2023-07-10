import React, { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css";
import axios from "axios";
import { io } from "socket.io-client";
import { Navigate, useLoaderData } from "react-router-dom";
import { UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
import { XPBar } from "../../components/XPBar/XPBar";
import {
  GameStatsHeader,
  GameStatsItem,
} from "../../components/Game/GameStatsItem";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { GameStatsDto } from "../../type/game.type";
import { AuthContext } from "../../components/Auth/dto";
import jwt_decode from "jwt-decode";
import { apiBaseURL } from "../../utils/constant";
import { ErrorContext } from "../../components/Modal/modalContext";
import { JwtPayload } from "../../type/client.type";

function RemoveFriend(data: any) {
  const [isMe, setIsMe] = useState(false);

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  useEffect(() => {
    if (payload.id === data.data.id.toString()) setIsMe(true);
  }, [data.data.id, payload.id]);

  const handleRemoveButton = async () => {
    await axios
      .put(apiBaseURL + `user/remove/${data.data.id}`, null, {
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
      .put(apiBaseURL + `user/block/${data.data.id}`, null, {
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

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  useEffect(() => {
    if (
      data.data.id &&
      (payload.id === data.data.id || payload.id === data.data.id.toString())
    )
      setIsMe(true);
    socketRef.current = io(apiBaseURL);
  }, []);

  if (!data.data.requestedId || !data.data.blockedById || !data.data.id)
    return <></>;

  const handleButton = async () => {
    await axios
      .put(apiBaseURL + `user/request/${data.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const name: string = payload.nickname;
        const mess = { friend: data, from: name };
        socketRef.current.emit("friendRequest", mess);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleUnblockButton = async () => {
    await axios
      .put(apiBaseURL + `user/unblock/${data.data.id}`, null, {
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
    data.data.requestedId &&
    data.data.blockedById &&
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

  const token = localStorage.getItem("token");
  let payload: JwtPayload | null = null;
  if (token) payload = jwt_decode(token as string);

  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (!payload) return;
    if (data.friendsId && data.friendsId.includes(parseInt(payload.id)))
      setIsFriend(true);
  }, []);

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  const winrate: number = calculateWinrate(data);

  if (
    payload &&
    data.blockedById &&
    data.blockedId.includes(parseInt(payload.id))
  ) {
    return (
      <div className="blocked">
        <h3>
          This User Blocked you. You cannot visit his profilePage anymore.
        </h3>
      </div>
    );
  }

  return (
    <div className={"profile-page"}>
      <div className={"profile-infobox"}>
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
      <div className={"profile-stats"}>
        <div id={"elo"}>
          <div>ELO</div>
          <div>{data.ranking}</div>
        </div>
        <div id={"game-played"}>
          <div>Game played</div>
          <div>{data.games?.length}</div>
        </div>
        <div id={"winrate"}>
          <div>Winrate</div>
          <div>{winrate}%</div>
        </div>
      </div>
      <div className={"games-stats-box"}>
        <h5 id={"games-stats-title"}>Match history</h5>
        <hr id={"games-stats-hrbar"} />
        <GameStatsHeader />
        <div className={"matches-table"}>
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
