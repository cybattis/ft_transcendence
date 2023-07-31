import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import axios from "axios";
import { Navigate, useLoaderData } from "react-router-dom";
import { UserFriend, UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
import {
  GameStatsHeader,
  GameStatsItem,
} from "../../components/Game/GameStatsItem";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { GameStatsDto } from "../../type/game.type";
import jwt_decode from "jwt-decode";
import { apiBaseURL } from "../../utils/constant";
import { ErrorContext } from "../../components/Modal/modalContext";
import { JwtPayload } from "../../type/client.type";
import { RgbColor, hslToRgb, RGBToHSL } from "../../utils/colors";
import { MessageModal } from "../../components/Modal/MessageModal";
import { UserData } from "./user-data";
import { ChatClientSocket } from "../Chat/Chat-client";
import {AuthContext} from "../../components/Auth/auth.context";

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
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token = localStorage.getItem("token");

  const handleUnblockButton = async () => {
    await axios
      .put(apiBaseURL + `user/unblock/${props.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        if (error.response === undefined) {
          setErrorMessage("Error unknown...");
        } else if (
          error.response.status === 403 ||
          error.response.status === 400
        ) {
          localStorage.clear();
          setAuthed(false);
          setErrorMessage("Session expired, please login again!");
        } else {
          setErrorMessage(error.response.data.message + "!");
        }
        return <Navigate to={"/"} />;
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
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token = localStorage.getItem("token");

  const handleAddFriend = async () => {
    console.log("ADD FRIEND: ", props.data.id);
    await axios
      .put(apiBaseURL + `user/request/${props.data.id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        ChatClientSocket.sendFriendRequest(props.data.id);
        props.setStatus(relationStatus.REQUESTED);
      })
      .catch((error) => {
        if (error.response === undefined) {
          setErrorMessage("Error unknown...");
        } else if (
          error.response.status === 403 ||
          error.response.status === 400
        ) {
          localStorage.clear();
          setAuthed(false);
          setErrorMessage("Session expired, please login again!");
        } else {
          setErrorMessage(error.response.data.message + "!");
        }
        return <Navigate to={"/"} />;
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
        ChatClientSocket.notificationEvent(props.data.id);
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

function PaddleColor(props: { oldColor: RgbColor }) {
  const [hue, setHue] = useState(RGBToHSL(props.oldColor).h);
  const { setErrorMessage } = useContext(ErrorContext);
  const [showSuccess, setShowSuccess] = useState(false);
  const color: RgbColor = hslToRgb({ h: hue, s: 100, l: 50 });

  console.log("hue: ", hue);

  const style = {
    width: "20px",
    height: "100px",
    backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
  };

  function updatePaddleColor(): void {
    function componentToHex(c: number) {
      const hex: string = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }

    const colorString: string =
      componentToHex(color.r) +
      componentToHex(color.g) +
      componentToHex(color.b);
    axios
      .put(
        apiBaseURL + "user/customization/paddleColor",
        { color: colorString },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res): void => {
        UserData.updatePaddleColor(colorString);
        setShowSuccess(true);
      })
      .catch((err): void => {
        const response = err.response?.data;
        setErrorMessage(response?.message);

        const actualColor: RgbColor = {
          r: parseInt(response?.paddleColor.substring(0, 2), 16),
          g: parseInt(response?.paddleColor.substring(2, 4), 16),
          b: parseInt(response?.paddleColor.substring(4, 6), 16),
        };
        setHue(RGBToHSL(actualColor).h);
      });
  }

  return (
    <>
      <div className={"customization-content"}>
        <h5>Customize your paddle</h5>
        <div className={"customization-box"}>
          <div className={"color-slider"}>
            <div className={"color-gradient"}></div>
            <input
              type="range"
              min="0"
              max="360"
              className="slider"
              id="myRange"
              value={hue}
              onChange={(e) => setHue(parseInt(e.target.value))}
            ></input>
            <button
              className={"update-color-button"}
              onClick={updatePaddleColor}
            >
              Update color
            </button>
          </div>
          <div className={"paddle-container"}>
            <div style={style}></div>
          </div>
        </div>
      </div>
      {showSuccess ? (
        <MessageModal
          msg={"Color updated successfully!"}
          onClose={() => setShowSuccess(false)}
        />
      ) : null}
    </>
  );
}

export function Profile() {
  let data: UserInfo = useLoaderData() as UserInfo;
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const [friendStatus, setFriendStatus] = useState(relationStatus.NONE);
  const [customization, setCustomization] = useState(false);

  const token = localStorage.getItem("token");
  let payload: JwtPayload | null = null;
  if (token) payload = jwt_decode(token as string);

  function checkFriendStatus(meData: UserFriend) {
    if (!payload) return;

    console.log("meData: ", meData);
    if (payload.id === data.id.toString()) setFriendStatus(relationStatus.ME);
    else if (meData.friendsId && meData.friendsId.includes(Number(payload.id)))
      setFriendStatus(relationStatus.FRIEND);
    else if (
      meData.requestedId &&
      meData.requestedId.includes(Number(payload.id))
    )
      setFriendStatus(relationStatus.REQUESTED);
    else if (meData.blockedId && meData.blockedId.includes(Number(payload.id)))
      setFriendStatus(relationStatus.BLOCKED);
    else setFriendStatus(relationStatus.NONE);
  }

  useEffect(() => {
    async function fetchData() {
      if (data.id === undefined) return;
      axios
        .get(apiBaseURL + `user/friends-data/${data.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log("res: ", res.data);
          checkFriendStatus(res.data);
        })
        .catch((error) => {
          if (error.response === undefined) {
            setErrorMessage("Error unknown...");
          } else if (
            error.response.status === 403 ||
            error.response.status === 400
          ) {
            localStorage.clear();
            setAuthed(false);
            setErrorMessage("Session expired, please login again!");
          } else {
            setErrorMessage(error.response.data.message + "!");
          }
          return <Navigate to={"/"} />;
        });
    }

    fetchData().then(() => {});
    ChatClientSocket.onNotificationEvent(fetchData);

    return () => {
      ChatClientSocket.offNotificationEvent(fetchData);
    }
  }, [checkFriendStatus, data, token]);

  if (token === null) {
    setAuthed(false);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  const winrate: number = calculateWinrate(data);
  const oldColor: RgbColor = {
    // change to color from db
    r: data.paddleColor ? parseInt(data.paddleColor.substring(0, 2), 16) : 255,
    g: data.paddleColor ? parseInt(data.paddleColor.substring(2, 4), 16) : 255,
    b: data.paddleColor ? parseInt(data.paddleColor.substring(4, 6), 16) : 255,
  };

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
          ) : (
            <button
              className="friendButton customization-button"
              onClick={() => setCustomization(!customization)}
            >
              Customization
            </button>
          )}
        </div>
      </div>
      {customization ? <PaddleColor oldColor={oldColor} /> : null}
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
