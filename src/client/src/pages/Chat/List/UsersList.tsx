import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseURL } from "../../../utils/constant";
import { JwtPayload } from "../../../type/client.type";
import { ChatInterface } from "../Interface/chat.interface";
import jwt_decode from "jwt-decode";
import "./UserList.css";

export default function UsersList(props: {
  channel: string;
  messages: ChatInterface[];
}) {
  const [usersList, setUsersList] = useState([]);
  const [banList, setBanList] = useState([]);
  const [muteList, setMuteList] = useState([]);
  const [isOpe, setIsOpe] = useState(false);

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  async function fecthLists() {
    if (!props.channel || !props.channel[0]) return;
    setIsOpe(false);
    let canal = props.channel;
    if (canal[0] === "#") canal = canal.slice(1);
    else return <></>;

    await axios
      .get(apiBaseURL + "chat-controller/channelName/" + canal, {
        headers: {
          token: token,
        },
      })
      .then((res) => {
        if (res.data.operator.includes(payload.nickname)) setIsOpe(true);
        setUsersList(res.data.users);
        setBanList(res.data.ban);
        setMuteList(res.data.mute);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    fecthLists();
  }, [props.channel, props.messages]);

  function ListBan() {
    if (banList) {
      return (
        <>
          <h4>Ban</h4>
          {banList.map((username) => (
            <button className="user-list" key={username} value={username}>
              {username}
            </button>
          ))}
        </>
      );
    }
    return (
      <>
        <h4>Ban</h4>
      </>
    );
  }

  function ListMute() {
    if (muteList) {
      return (
        <>
          <h4>Mute</h4>
          {muteList &&
            muteList.map((username) => (
              <button className="user-list" key={username} value={username}>
                {username}
              </button>
            ))}
        </>
      );
    }
    return (
      <>
        <h4>Mute</h4>
      </>
    );
  }

  return (
    <div className="lists">
      <h4>Users</h4>
      {usersList &&
        usersList.map((username) => (
          <button className="user-list" key={username} value={username}>
            {username}
          </button>
        ))}
      {isOpe && <ListBan />}
      {isOpe && <ListMute />}
    </div>
  );
}
