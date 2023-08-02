import { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Notifications.css";
import { Avatar } from "../../components/Avatar";
import { apiBaseURL } from "../../utils/constant";
import { NotifContext } from "../../components/Auth/dto";
import { Navigate } from "react-router-dom";
import { ErrorContext } from "../../components/Modal/modalContext";
import { AuthContext } from "../../components/Auth/dto";
import { ChatClientSocket } from "../Chat/Chat-client";

export default function Notifications() {
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token: string | null = localStorage.getItem("token");
  const { setNotif } = useContext(NotifContext);

  const [invits, setInvits] = useState([
    {
      nickname: "",
      avatarUrl: "",
      id: 0,
    },
  ]);

  const [channelInvits, setChannelInvits] = useState([]);

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
    if (channel[0] === '#')
      channel = channel.substring(1);
    console.log(channel);
    const addr = apiBaseURL + "chat-controller/request/" + channel;
    await axios
    .put(addr, null,  {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      const newInvits: any = channelInvits.filter((invits :string) => invits !== invits);
      setChannelInvits(newInvits);
    });
  }

  async function handleDeclineChannel(channel: string) {
    if (channel[0] === '#')
      channel = channel.substring(1);
    console.log(channel);
    const addr = apiBaseURL + "chat-controller/decline/" + channel;
    await axios.put(addr, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) =>{
      const newInvits: any = channelInvits.filter((invits :string) => invits !== invits);
      setChannelInvits(newInvits);
    });
  }

  function InviteChannel(){
    console.log("Channel Invit", channelInvits);
    return (<>
      {
        channelInvits.map((info) => (
          <div className="ctnr-notif-channel">
            <div className="invits-channel">
              <div key={info}>
                <p className="text-channel">
                  You are invited to the channel {info}
                </p>
                <div className="buttons">
                  <button
                    className="refuse"
                    onClick={() => handleDeclineChannel(info)}
                  >
                    <div className="cross"></div>Decline
                  </button>
                  <button
                    className="accept"
                    onClick={() => handleAcceptChannel(info)}
                  >
                    <div className="tick-mark"></div>Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      }
    </>)
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
          console.log(res.data);
          setInvits(res.data);
          console.log("VALUE: ", invits);
        })
        .catch((error) => {
          if (error.response === undefined) {
            localStorage.clear();
            setErrorMessage("Error unknown...");
          } else if (error.response.status === 403) {
            localStorage.clear();
            setAuthToken(null);
            setErrorMessage("Session expired, please login again!");
          } else setErrorMessage(error.response.data.message + "!");
        });
    }

    async function fetchInvChannel() {
      const urlInv = apiBaseURL + "user/request/channel";
      await axios
        .get(urlInv, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setChannelInvits(res.data);
          console.log("Channel to join", res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    
    fetchInvChannel().then();
    fetchFriends().then(() => {});

    ChatClientSocket.onNotificationEvent(fetchFriends);
  }, []);


  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  function FetchFriend () {
    return  (     
    <div className="notifPage">
    <h2 className="notifTitle">Notifications</h2>
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
    </div>
  </div>);
  }

  //Faire une map pour afficher toutes invites a la suite
  if (invits && invits[0] && invits[0].id > 0) {
    setNotif(true);
    return (
      <FetchFriend/>
    );
  } else if (channelInvits.length > 0){
    setNotif(true);
    return (
    <InviteChannel/>)

  } 
  else setNotif(false);
  
  return (
    <div className="noNotifTitle">
      <h2>No Notifications</h2>
    </div>
  );
}
