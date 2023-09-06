import { Navigate } from "react-router-dom";
import "./NavButton.css";
import { useContext, useEffect, useState } from "react";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";
import { ChatClientSocket } from "../../pages/Chat/Chat-client";
import { AuthContext } from "../Auth/auth.context";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { MultiplayerClient } from "../../game/networking/multiplayer-client";
import { removeMultiplayerGame } from "../../game/PongManager";
import { GameInvite } from "../../type/game.type";
import { useFetcher } from "../../hooks/UseFetcher";
import { PageLink } from "../Navigation/PageLink";
import { Fetching } from "../../utils/fetching";
import put = Fetching.put;
import { Navigation } from "../../utils/navigation";

export function NavButton(props: {
  link: string;
  content?: string | any;
  callback?: () => void;
}) {
  return (
    <PageLink to={props.link} className={"navLink"} onClick={props.callback}>
      {props.content}
    </PageLink>
  );
}

export function PlayButton(props: { text: string; link: string; callback?: () => void;}) {
  return (
    <PageLink to={props.link} className="playButton" onClick={props.callback}>
      {props.text}
    </PageLink>
  );
}

export function DisconnectButton(props: { callback?: () => void }) {
  const { setAuthed } = useContext(AuthContext);

  const handleDisconnect = async () => {
    if (props.callback) props.callback();

    await MatchmakingClient.leaveMatchmaking();
    await put<void>("auth/disconnect", {})
      .catch(() => {});
    Navigation.disconnect();
    setAuthed(false);
    return <Navigate to={'/'} />;
  };

  return (
    <PageLink
      to="/"
      className="navLink"
      id={"disconnectButton"}
      onClick={handleDisconnect}
    >
      Disconnect
    </PageLink>
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
    const fetchNotifs = () => {
      get<boolean>("user/notifs")
      .then((res) => {
        if (res) setHasNotifs(true);
      })
      .catch(() => {});

      get<GameInvite[]>("game-invites")
      .then((res) => {
        if (res && res[0]) setHasNotifs(true);
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
    <PageLink to={`/notifications`} className="notifs" onClick={() => setHasNotifs(false)}>
      <BellNotif hasNotifs={hasNotifs} setHasNotifs={setHasNotifs}/>
      Notifs
    </PageLink>
  );
}
