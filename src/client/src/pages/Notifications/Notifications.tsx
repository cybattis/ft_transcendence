import { useEffect, useState } from "react";
import "./Notifications.css";
import { Avatar } from "../../components/Avatar";
import { ChatClientSocket } from "../Chat/Chat-client";
import { useFetcher } from "../../hooks/UseFetcher";
import { ChannelInvite, UserFriend, UserFriendsData } from "../../type/user.type";

export default function Notifications() {
  const [invits, setInvits] = useState<UserFriend[]>([]);
  const [channelInvits, setChannelInvits] = useState<ChannelInvite[]>([]);

  const { get, put, showErrorInModal } = useFetcher();

  async function handleAccept(id: number) {
    if (id === undefined) return;

    put<UserFriendsData>("user/accept/" + id, {})
      .then(res => {
        ChatClientSocket.notificationEvent(id);
        removeNotif(id);
      })
      .catch(showErrorInModal);
  }

  async function handleDecline(id: number) {
    if (id === undefined) return;

    put<UserFriendsData>("user/decline/" + id, {})
      .then(res => {
        ChatClientSocket.notificationEvent(id);
        removeNotif(id);
      })
      .catch(showErrorInModal);
  }

  async function removeNotif(id: number) {
    const newInvits: any = invits.filter((invits) => invits.id !== id);
    setInvits(newInvits);
  }

  async function handleAcceptChannel(channel: string){
    const oldChannel = channel;
    if (channel[0] === '#')
      channel = channel.substring(1);
    put("chat-controller/request/" + channel, {})
      .then(res => {
        const newInvits: any = channelInvits.filter((channelInvits) => channelInvits.joinChannel !== oldChannel);
        setChannelInvits(newInvits);
      })
      .catch(showErrorInModal);
  }

  async function handleDeclineChannel(channel: string) {
    const oldChannel = channel;
    if (channel[0] === '#')
      channel = channel.substring(1);
    put("chat-controller/decline/" + channel, {})
      .then(res =>{
        const newInvits: any = channelInvits.filter((channelInvits) => channelInvits.joinChannel !== oldChannel);
        setChannelInvits(newInvits);
      })
      .catch(showErrorInModal);
  }

  function InviteChannel(){
    return (<div className="list">
      {
        channelInvits.map((channelInvits, index) => (
          <div className="notifsElements">
            <div className="invits" key={index}>
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
    async function fetchInvites() {
      get<UserFriend[]>("user/requested")
        .then(requests => setInvits(requests))
        .catch(() => {});

      get<ChannelInvite[]>("user/request/channel")
        .then(channels => setChannelInvits(channels))
        .catch(() => {});
    }

    fetchInvites();
    ChatClientSocket.onNotificationEvent(fetchInvites);

    return () => {
      ChatClientSocket.offNotificationEvent(fetchInvites);
    }
  }, []);

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
  if (invits.length > 0 || channelInvits.length > 0) {
    return (
      <>
        <div className="notifPage">
          <h2 className="notifTitle">Notifications</h2>
          <div className= "invites-elements">
            {invits.length > 0 && <FetchFriend/>}
            {channelInvits.length > 0 && <InviteChannel/>}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="noNotifTitle">
        <h2>No Notifications</h2>
      </div>
    );
  }
}
