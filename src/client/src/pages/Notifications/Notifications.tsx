import { useEffect, useState } from "react";
import "./Notifications.css";
import { Avatar } from "../../components/Avatar";
import { ChatClientSocket } from "../Chat/Chat-client";
import { useFetcher } from "../../hooks/UseFetcher";
import { ChannelInvite, UserFriend, UserFriendsData, UserInfo } from "../../type/user.type";
import { GameInvite, GameType } from "../../type/game.type";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";

interface NotificationItemProps {
  key: number,
  avatar: string | undefined,
  text: string,
  onAccept: () => void,
  onDecline: () => void
}

export default function Notifications() {
  const [invits, setInvits] = useState<UserFriend[]>([]);
  const [channelInvits, setChannelInvits] = useState<ChannelInvite[]>([]);
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([]);

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
    const newInvits: UserFriend[] = invits.filter((invits) => invits.id !== id);
    setInvits(newInvits);
  }

  async function handleAcceptChannel(channel: string){
    const oldChannel = channel;
    if (channel[0] === '#')
      channel = channel.substring(1);
    put("chat-controller/request/" + channel, {})
      .then(res => {
        const newInvits: ChannelInvite[] = channelInvits.filter((channelInvits) => channelInvits.joinChannel !== oldChannel);
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

  async function handleAcceptGame(invitingPlayerId: number, type: GameType) {
    if (type === GameType.CASUAL)
      MatchmakingClient.acceptInviteToCasualGame(invitingPlayerId);
    else
      MatchmakingClient.acceptInviteToRankedGame(invitingPlayerId);
    setGameInvites(gameInvites.filter(invite => invite.invitingPlayerId !== invitingPlayerId));
  }

  async function handleDeclineGame(invitingPlayerId: number, type: GameType) {
    if (type === GameType.CASUAL)
      MatchmakingClient.declineInviteToCasualGame(invitingPlayerId);
    else
      MatchmakingClient.declineInviteToRankedGame(invitingPlayerId);
    setGameInvites(gameInvites.filter(invite => invite.invitingPlayerId !== invitingPlayerId));
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

  function GameInvites() {
    return (<div className="list">
      {gameInvites.map((invite, index) => (
          <GameInvite invite={invite} index={index}/>
      ))}
    </div>);
  }

  function GameInvite(props: { invite: GameInvite, index: number }) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
      get<UserInfo>("user/profile/id/" + props.invite.invitingPlayerId)
        .then(infos => setUserInfo(infos))
        .catch(() => {});
    });

    return (userInfo === null ? <NotificationElementLoading key={props.index}/> :
      <NotificationElement
        key={props.index}
        avatar={userInfo.avatarUrl}
        text={userInfo.nickname + " invited you to play a " + (props.invite.type === GameType.CASUAL) ? "casual" : "ranked" + " game"}
        onAccept={() => handleAcceptGame(props.invite.invitingPlayerId, props.invite.type)}
        onDecline={() => handleDeclineGame(props.invite.invitingPlayerId, props.invite.type)}
      />
    );
  }

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const friendInvites = await get<UserFriend[]>("user/requested");
        const channelInvites = await get<ChannelInvite[]>("user/request/channel");
        const gameInvites = await get<GameInvite[]>("game-invites");

        setInvits(friendInvites);
        setChannelInvits(channelInvites);
        setGameInvites(gameInvites);
      } catch (error) {}
    }

    fetchNotifications();
    ChatClientSocket.onNotificationEvent(fetchNotifications);

    return () => {
      ChatClientSocket.offNotificationEvent(fetchNotifications);
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

  function NotificationElement(props: NotificationItemProps) {
    return (
      <div key={props.key}>
        <div className="notifsElements">
          <div className="invits">
            <Avatar size="50px" img={props.avatar} />
            <p className="notifText">
              {props.text}
            </p>
            <div className="buttons">
              <button
                className="refuse"
                onClick={props.onDecline}
              >
                <div className="cross"></div>Decline
              </button>
              <button
                className="accept"
                onClick={props.onAccept}
              >
                <div className="tick-mark"></div>Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function NotificationElementLoading(props: { key: number }) {
    return (
      <div key={props.key}>
        <div className="notifsElements">
          <div className="invits">
            Loading...
          </div>
        </div>
      </div>
    );
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
            {gameInvites.length > 0 && <GameInvites/>}
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
