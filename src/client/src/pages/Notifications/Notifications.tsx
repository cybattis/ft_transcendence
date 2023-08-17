import { useContext, useEffect, useState } from "react";
import "./Notifications.css";
import { Avatar } from "../../components/Avatar";
import { ChatClientSocket } from "../Chat/Chat-client";
import { useFetcher } from "../../hooks/UseFetcher";
import { ChannelInvite, UserFriend, UserFriendsData, UserInfo } from "../../type/user.type";
import { GameInvite, GameType } from "../../type/game.type";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { useNavigate } from "react-router-dom";
import { PopupContext } from "../../components/Modal/Popup.context";

interface NotificationItemProps {
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
  const { setErrorMessage } = useContext(PopupContext);
  const navigate = useNavigate();

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
      MatchmakingClient.acceptInviteToCasualGame(invitingPlayerId)
        .then(() => {navigate("/game"); console.log("callbackkkkkk");})
        .catch((err) => setErrorMessage(err.message));
    else
      MatchmakingClient.acceptInviteToRankedGame(invitingPlayerId)
        .then(() => navigate("/game"))
        .catch((err) => setErrorMessage(err.message));
    setGameInvites(gameInvites.filter(invite => invite.invitingPlayerId !== invitingPlayerId));
  }

  async function handleDeclineGame(invitingPlayerId: number, type: GameType) {
    if (type === GameType.CASUAL)
      MatchmakingClient.declineInviteToCasualGame(invitingPlayerId)
        .catch((err) => setErrorMessage(err.message));
    else
      MatchmakingClient.declineInviteToRankedGame(invitingPlayerId)
        .catch((err) => setErrorMessage(err.message));
    setGameInvites(gameInvites.filter(invite => invite.invitingPlayerId !== invitingPlayerId));
  }

  function InviteChannel(){
    return (<div className="list">
      {
        channelInvits.map((channelInvits, index) => (
          <NotificationElement
            key={index}
            avatar={channelInvits.invitedByAvatar}
            text={channelInvits.invitedByUsername + " invited you to join " + channelInvits.joinChannel}
            onAccept={() => handleAcceptChannel(channelInvits.joinChannel)}
            onDecline={() => handleDeclineChannel(channelInvits.joinChannel)}
          />
        ))
      }
    </div>
    );
  }

  function FetchFriend () {
    return  (
      <div className="list">
        {invits.map((invits, index) =>
          <NotificationElement
            key={index}
            avatar={invits.avatarUrl}
            text={invits.nickname + " wants to be your friend"}
            onAccept={() => handleAccept(invits.id)}
            onDecline={() => handleDecline(invits.id)}
          />
        )}
      </div>);
  }

  function GameInvites() {
    return (<div className="list">
      {gameInvites.map((invite, index) => (
          <GameInvite invite={invite} key={index}/>
      ))}
    </div>);
  }

  function GameInvite(props: { invite: GameInvite }) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
      get<UserInfo>("user/profile/id/" + props.invite.invitingPlayerId)
        .then(infos => setUserInfo(infos))
        .catch(() => {});
    });

    return (userInfo === null ? <NotificationElementLoading/> :
      <NotificationElement
        avatar={userInfo.avatarUrl}
        text={userInfo.nickname + " invited you to play a " + ((props.invite.type === GameType.CASUAL) ? "casual" : "ranked") + " game"}
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

  function NotificationElement(props: NotificationItemProps) {
    return (
      <div>
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

  function NotificationElementLoading() {
    return (
      <div>
        <div className="notifsElements">
          <div className="invits">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  //Faire une map pour afficher toutes invites a la suite
  if (invits.length > 0 || channelInvits.length > 0 || gameInvites.length > 0) {
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
