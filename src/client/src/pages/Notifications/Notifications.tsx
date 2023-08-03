import { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Notifications.css";
import { Avatar } from "../../components/Avatar";
import { apiBaseURL } from "../../utils/constant";
import { Navigate } from "react-router-dom";
import { ErrorContext } from "../../components/Modal/modalContext";
import { ChatClientSocket } from "../Chat/Chat-client";
import {AuthContext} from "../../components/Auth/auth.context";

export default function Notifications() {
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token: string | null = localStorage.getItem("token");
  const [invits, setInvits] = useState([
    {
      nickname: "",
      avatarUrl: "",
      id: 0,
    },
  ]);
  const [channelInvits, setChannelInvits] = useState([
    {
      id: 0,
      joinChannel: "",
      invitedByAvatar: "",
      invitedByUsername: "",
    },
  ]);


  async function handleAccept(id: number) {
    if (!id) return;

    await axios
      .put(apiBaseURL + "user/accept/" + id, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        ChatClientSocket.notificationEvent(id);
        removeNotif(id);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function handleDecline(id: number) {
    if (!id) return;

    await axios
      .put(apiBaseURL + "user/decline/" + id, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        ChatClientSocket.notificationEvent(id);
        removeNotif(id);
      });
  }

  async function removeNotif(id: number) {
    const newInvits: any = invits.filter((invits) => invits.id !== id);
    setInvits(newInvits);
  }

  async function handleAcceptChannel(channel: string){
    const oldChannel = channel;
    if (channel[0] === '#')
      channel = channel.substring(1);
    const addr = apiBaseURL + "chat-controller/request/" + channel;
    await axios
    .put(addr, null,  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      const newInvits: any = channelInvits.filter((channelInvits) => channelInvits.joinChannel !== oldChannel);
      setChannelInvits(newInvits);
    });
  }

  async function handleDeclineChannel(channel: string) {
    const oldChannel = channel;
    if (channel[0] === '#')
      channel = channel.substring(1);
    const addr = apiBaseURL + "chat-controller/decline/" + channel;
    await axios.put(addr, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) =>{
      const newInvits: any = channelInvits.filter((channelInvits) => channelInvits.joinChannel !== oldChannel);
      setChannelInvits(newInvits);
    });
  }

  function InviteChannel(){
    return (<div className="list">
      {
        channelInvits.map((channelInvits) => (
          <div className="notifsElements">
            <div className="invits" key={channelInvits.id}>
                <Avatar size="50px" img={channelInvits.invitedByAvatar} />
                <p className="notifText">
                  {channelInvits.invitedByUsername} invited you to the channel {channelInvits.joinChannel}
                </p>
                <div className="buttons">
                  <button
                    className="refuse"
                    onClick={() => handleDeclineChannel(channelInvits.joinChannel)}
                  >
                    <div className="cross"></div>Decline
                  </button>
                  <button
                    className="accept"
                    onClick={() => handleAcceptChannel(channelInvits.joinChannel)}
                  >
                    <div className="tick-mark"></div>Accept
                  </button>
                </div>
            </div>
          </div>
        ))
      }
    </div>)
  }

  useEffect(() => {

    async function fetchFriends() {
      await axios
        .get(apiBaseURL + "user/requested", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setInvits(res.data);
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

    async function fetchInvChannel() {
      await axios
        .get(apiBaseURL + "user/request/channel", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setChannelInvits(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    
    fetchInvChannel().then();
    fetchFriends().then(() => {});

    ChatClientSocket.onNotificationEvent(fetchFriends);
    ChatClientSocket.onNotificationEvent(fetchInvChannel);
  }, []);


  if (token === null) {
    setAuthed(false);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  function FetchFriend () {
    return  (     
    <div className="list">
      {invits.map((invits) => {
        return (
          <div key={invits.id}>
            <div className="notifsElements">
              <div className="invits">
                <Avatar size="50px" img={invits.avatarUrl} />
                <p className="notifText">
                  {invits.nickname} wants to be your Friend!
                </p>
                <div className="buttons">
                  <button
                    className="refuse"
                    onClick={() => handleDecline(invits.id)}
                  >
                    <div className="cross"></div>Decline
                  </button>
                  <button
                    className="accept"
                    onClick={() => handleAccept(invits.id)}
                  >
                    <div className="tick-mark"></div>Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>);
  }

  //Faire une map pour afficher toutes invites a la suite
  if (invits && invits[0] && invits[0].id > 0 && channelInvits && channelInvits[0] && channelInvits[0].invitedByUsername !== "") {
    return (
      <>
        <div className="notifPage">
          <h2 className="notifTitle">Notifications</h2>
          <div className= "invites-elements">
            <FetchFriend/>
            <InviteChannel/>
          </div>
        </div>
      </>
    );
  } else if (channelInvits && channelInvits[0] && channelInvits[0].invitedByUsername !== ""){
    return (
      <div className="notifPage">
      <h2 className="notifTitle">Notifications</h2>
        <div className= "invites-elements">
          <InviteChannel/>
        </div>
      </div>);
  } else if (invits && invits[0] && invits[0].id > 0){
    return (
    <div className="notifPage">
    <h2 className="notifTitle">Notifications</h2>
      <div className= "invites-elements">
        <FetchFriend/>
      </div>
    </div>)
  }
  else
  return (
    <div className="noNotifTitle">
      <h2>No Notifications</h2>
    </div>
  );
}
