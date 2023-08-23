import React, { useEffect, useState } from "react";
import { TokenData } from "../../../type/client.type";
import jwt_decode from "jwt-decode";
import "./UserList.css";
import { Channel, Chat } from "../../../type/user.type";
import { useFetcher } from "../../../hooks/UseFetcher";
import {TypeCheckers} from "../../../utils/type-checkers";

export default function UsersList(props: {
  channel: string;
  messages: Chat[];
  handleButton: (target: string) => void;
}) {
  const [usersList, setUsersList] = useState<string[]>([]);
  const [banList, setBanList] = useState<string[]>([]);
  const [muteList, setMuteList] = useState<string[]>([]);
  const [isOpe, setIsOpe] = useState(false);
  const { get } = useFetcher();

  useEffect(() => {
    let decoded: TokenData;
    const token = localStorage.getItem("token");
    if (!token)
      return;
    try {
      decoded = jwt_decode(token);
      if (!TypeCheckers.isTokenData(decoded))
        return;
    } catch (error) {
    }
    async function fecthLists() {
      if (!props.channel || !props.channel[0]) return;
      setIsOpe(false);
      let canal = props.channel;
      if (canal[0] === "#") canal = canal.slice(1);
      else return <></>;

      get<Channel | null>("chat-controller/channelName/" + canal)
        .then(channel => {
          if (!channel) return;
          if (channel.operator.includes(decoded.nickname)) setIsOpe(true);
          setUsersList(channel.users);
          setBanList(channel.ban);
          setMuteList(channel.mute);
        })
        .catch(() => {});
    }
    fecthLists();
  }, [props.messages, props.channel]);

  
  function ListBan() {
    if (banList) {
      return (
        <>
          <h4>Ban</h4>
          {banList.map((username) => (
            <button className="user-list" key={username} value={username} onClick={() => props.handleButton(username)}>
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
              <button className="user-list" key={username} value={username} onClick={() => props.handleButton(username)}>
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
          <button className="user-list" key={username} value={username} onClick={() => props.handleButton(username)}>
            {username}
          </button>
        ))}
      {isOpe && <ListBan />}
      {isOpe && <ListMute />}
    </div>
  );
}
