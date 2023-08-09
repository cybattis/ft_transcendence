import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Friends.css";
import { Avatar } from "../Avatar";
import { Link } from "react-router-dom";
import { apiBaseURL } from "../../utils/constant";
import { PopupContext } from "../Modal/Popup.context";
import { ChatClientSocket } from "../../pages/Chat/Chat-client";
import {AuthContext} from "../Auth/auth.context";

//Mettre un useState refresh automatique
function Online(data: any) {
  return (
    <div className="online">
      <div className="status">
        {data.inGame === true ? "In game" : "In menu"}
      </div>
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

  const [friendsStatus, setFriendsStatus] = useState([
    {
      id: 0,
      nickname: "",
      avatarUrl: "",
      online: false,
      inGame: false,
    },
  ]);

  useEffect(() => {
    async function fetchFriendsStatus() {
      await axios
        .get(apiBaseURL + "user/friends/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setFriendsStatus(res.data);
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
    fetchFriendsStatus().then();

    ChatClientSocket.onNotificationEvent(fetchFriendsStatus);
  }, []);

  if (friendsStatus && friendsStatus[0]) {
    return (
      <>
        <h4>Friends</h4>
        <>
          {friendsStatus.map((friendData) => {
            return (
              <div className="friends" key={friendData.nickname}>
                <Link
                  to={`/profile/${friendData.nickname}`}
                  className="friendLink"
                >
                  <div>
                    <p className="friendsImg">
                      <Avatar size="50px" img={friendData.avatarUrl} />
                    </p>
                    {friendData.online ? <Online inGame={friendData.inGame} /> : <Offline />}
                  </div>
                  <p className="nickname">{friendData.nickname}</p>
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
