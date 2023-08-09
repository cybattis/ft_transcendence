import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Friends.css";
import { Avatar } from "../Avatar";
import { Link } from "react-router-dom";
import { apiBaseURL } from "../../utils/constant";
import { PopupContext } from "../Modal/Popup.context";
import { ChatClientSocket } from "../../pages/Chat/Chat-client";
import { AuthContext } from "../Auth/auth.context";

//Mettre un useState refresh automatique
function Online(props: { inGame: boolean }) {
  console.log("inGame: ", props.inGame);
  return (
    <div className="online">
      <div className="status">{props.inGame ? "In game" : "In menu"}</div>
    </div>
  );
}

function Offline() {
  return <div className="offline"></div>;
}

function FriendsList() {
  const { setErrorMessage } = useContext(PopupContext);
  const { setAuthed } = useContext(AuthContext);

  const token = localStorage.getItem("token");

  const [dataOnline, setDataOnline] = useState([
    {
      nickname: "",
      avatarUrl: "",
      online: false,
      inGame: false,
      id: 0,
    },
  ]);

  const [dataOffline, setDataOffline] = useState([
    {
      nickname: "",
      avatarUrl: "",
      online: false,
      inGame: false,
      id: 0,
    },
  ]);

  useEffect(() => {
    async function fetchDataOnline() {
      await axios
        .get(apiBaseURL + "user/friends/online", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setDataOnline(res.data);
        })
        .catch((error) => {
          if (error.response === undefined) {
            localStorage.clear();
            setErrorMessage("Error unknown...");
          } else if (error.response.status === 403) {
            localStorage.clear();
            setAuthed(false);
            setErrorMessage("Session expired, please login again!");
          } else setErrorMessage(error.response.data.message + "!");
        });
    }
    async function fetchDataOffline() {
      await axios
        .get(apiBaseURL + "user/friends/offline", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setDataOffline(res.data);
        })
        .catch((error) => {
          if (error.response === undefined) {
            setErrorMessage("Error unknown...");
          } else if (error.response.status === 403) {
            localStorage.clear();
            setAuthed(false);
            setErrorMessage("Session expired, please login again!");
          } else setErrorMessage(error.response.data.message + "!");
        });
    }
    fetchDataOnline().then();
    fetchDataOffline().then();

    ChatClientSocket.onNotificationEvent(fetchDataOffline);
    ChatClientSocket.onNotificationEvent(fetchDataOnline);
  }, []);

  if ((dataOnline && dataOnline[0]) || (dataOffline && dataOffline[0])) {
    return (
      <>
        <h4>Friends</h4>
        <>
          {dataOnline.map((dataOnline) => {
            return (
              <div className="friends" key={dataOnline.nickname}>
                <Link
                  to={`/profile/${dataOnline.nickname}`}
                  className="friendLink"
                >
                  <div>
                    <p className="friendsImg">
                      <Avatar size="50px" img={dataOnline.avatarUrl} />
                    </p>
                    {<Online inGame={dataOnline.inGame} />}
                  </div>
                  <p className="nickname">{dataOnline.nickname}</p>
                </Link>
              </div>
            );
          })}
          {dataOffline.map((dataOffline) => {
            return (
              <div className="friends" key={dataOffline.nickname}>
                <Link
                  to={`/profile/${dataOffline.nickname}`}
                  className="friendLink"
                >
                  <div>
                    <p className="friendsImg">
                      <Avatar size="50px" img={dataOffline.avatarUrl} />
                    </p>
                    {<Offline />}
                  </div>
                  <p className="nickname">{dataOffline.nickname}</p>
                </Link>
              </div>
            );
          })}
        </>
      </>
    );
  } else return <h4>No Friends</h4>;
}

export function Friends() {
  return (
    <div className="friendList">
      <FriendsList />
    </div>
  );
}
