import { Link, Navigate } from "react-router-dom";
import "./NavButton.css";
import { useContext, useEffect, useState } from "react";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";
import { ChatClientSocket } from "../../pages/Chat/Chat-client";
import { AuthContext } from "../Auth/auth.context";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { MultiplayerClient } from "../../game/networking/multiplayer-client";
import { removeMultiplayerGame } from "../../game/PongManager";
import { useFetcher } from "../../hooks/UseFetcher";

export function NavButton(props: {
  link: string;
  content?: string | any;
  callback?: () => void;
}) {
  return (
    <Link to={props.link} className="navLink" onClick={props.callback}>
      {props.content}
    </Link>
  );
}

export function PlayButton(props: { text: string; link: string; callback?: () => void;}) {
  return (
    <Link to={props.link} className="playButton" onClick={props.callback}>
      {props.text}
    </Link>
  );
}

export function DisconnectButton(props: { callback?: () => void }) {
  const { setAuthed } = useContext(AuthContext);

  const handleDisconnect = async () => {
    if (props.callback) props.callback();

    setAuthed(false);
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
    ChatClientSocket.disconnect();
    MultiplayerClient.disconnect();
    MatchmakingClient.disconnect();
    localStorage.clear();
    return <Navigate to={'/'} />;
  };

  return (
    <Link
      to="/"
      className="navLink"
      id={"disconnectButton"}
      onClick={handleDisconnect}
    >
      Disconnect
    </Link>
  );
}

function BellNotif({
  hasNotifs,
  setHasNotifs,
}: {
  hasNotifs: boolean;
  setHasNotifs: (value: boolean) => void;
}) {
  const { get } = useFetcher();

  useEffect(() => {
    const fetchNotifs = async () => {
      get<boolean>("user/notifs")
      .then((res) => {
        if (res) setHasNotifs(true);
      })
      .catch(() => {});
    };

    const notifHandler = () => {
      setHasNotifs(true);
    };

    fetchNotifs();
    ChatClientSocket.onNotificationEvent(notifHandler);

    return () => {
      ChatClientSocket.offNotificationEvent(notifHandler);
    };
  }, []);

  const logo: string = hasNotifs ? notifsLogoOn : notifsLogo;

  return <img src={logo} alt={"logo notif"} width={45} height={45} />;
}

export function Notification() {
  const [hasNotifs, setHasNotifs] = useState(false);

  return (
    <Link to={`/notifications`} className="notifs" onClick={() => {
      setHasNotifs(false)
      removeMultiplayerGame();
      MultiplayerClient.quitGame();
    }} >
      <BellNotif hasNotifs={hasNotifs} setHasNotifs={setHasNotifs}/>
      Notifs
    </Link>
  );
}
