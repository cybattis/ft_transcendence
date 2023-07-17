import React, { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css";
import axios from "axios";
import { io } from "socket.io-client";
import { Navigate, useLoaderData } from "react-router-dom";
import { UserFriend, UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
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

enum relationStatus {
  NONE,
  ME,
  FRIEND,
  REQUESTED,
  BLOCKED,
}

interface FriendRequestProps {
  data: UserInfo;
  status: relationStatus;
  setStatus: (status: relationStatus) => void;
}

function BlockUser(props: FriendRequestProps) {
  const token = localStorage.getItem("token");

  const handleUnblockButton = async () => {
    await axios
      .put(apiBaseURL + `user/unblock/${props.data.id}`, null, {
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
      .put(apiBaseURL + `user/block/${props.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (props.status !== relationStatus.BLOCKED) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleBlockButton}
        >
          BLOCK
        </button>
      </>
    );
  } else {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleUnblockButton}
        >
          UNBLOCK
        </button>
      </>
    );
  }
}

function FriendRequest(props: FriendRequestProps) {
  const socketRef = useRef<any>(null);
  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  useEffect(() => {
    socketRef.current = io(apiBaseURL);
    console.log("WS Connected: ", socketRef.current.connected);
  }, []);

  const handleAddFriend = async () => {
    await axios
      .put(apiBaseURL + `user/request/${props.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const name: string = payload.nickname;
        const mess = { friend: props.data, from: name };
        socketRef.current.emit("friendRequest", mess);
        props.setStatus(relationStatus.REQUESTED);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleRemoveButton = async () => {
    await axios
      .put(apiBaseURL + `user/remove/${props.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        props.setStatus(relationStatus.NONE);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (props.status === relationStatus.NONE) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleAddFriend}
        >
          ADD FRIEND
        </button>
      </>
    );
  } else if (props.status === relationStatus.FRIEND) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleRemoveButton}
        >
          REMOVE FRIEND
        </button>
      </>
    );
  } else {
    return (
      <>
        <button className="friendButton">PENDING...</button>
      </>
    );
  }
}

export function Profile() {
  let data = useLoaderData() as UserInfo;
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const [friendStatus, setFriendStatus] = useState(relationStatus.NONE);

  const token = localStorage.getItem("token");
  let payload: JwtPayload | null = null;
  if (token) payload = jwt_decode(token as string);

  function checkFriendStatus(meData: UserFriend) {
    if (!payload) return;
    console.log(payload.id, data.id);
    if (payload.id == data.id.toString()) setFriendStatus(relationStatus.ME);
    else if (
      meData.FriendsId &&
      meData.FriendsId.includes(parseInt(payload.id))
    )
      setFriendStatus(relationStatus.FRIEND);
    else if (
      meData.RequestedId &&
      meData.RequestedId.includes(parseInt(payload.id))
    )
      setFriendStatus(relationStatus.REQUESTED);
    else if (
      meData.blockedId &&
      meData.blockedId.includes(parseInt(payload.id))
    )
      setFriendStatus(relationStatus.BLOCKED);
    else setFriendStatus(relationStatus.NONE);
  }

  useEffect(() => {
    async function fetchData() {
      axios
        .get(apiBaseURL + `user/friends`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res.data);
          checkFriendStatus(res.data);
        });
    }

    fetchData().then(() => {});
  }, [checkFriendStatus]);

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  const winrate: number = calculateWinrate(data);

  return (
    <div className={"profile-page"}>
      <div className={"profile-infobox-background"}>
        <div className={"profile-infobox"}>
          <Avatar size="200px" img={data.avatarUrl} />
          <div id="info">
            <div id="header">
              <h1 id={"nickname"}>{data.nickname}</h1>
            </div>
          </div>
          {friendStatus !== relationStatus.ME ? (
            <div id={"friend-request"}>
              <FriendRequest
                data={data}
                status={friendStatus}
                setStatus={setFriendStatus}
              />
              <BlockUser
                data={data}
                status={friendStatus}
                setStatus={setFriendStatus}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className={"profile-stats"}>
        <div id={"level"}>
          <div>Level</div>
          <div>{data.level}</div>
        </div>
        <div id={"xp"}>
          <div>XP</div>
          <div>{data.xp}</div>
        </div>
        <div id={"elo"}>
          <div>ELO</div>
          <div>{data.ranking}</div>
        </div>
        <div id={"game-played"}>
          <div>Matches</div>
          <div>{data.games?.length}</div>
        </div>
        <div id={"winrate"}>
          <div>Winrate</div>
          <div>{winrate.toFixed()}%</div>
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
