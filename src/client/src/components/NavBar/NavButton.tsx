import { Link, Navigate } from "react-router-dom";
import "./NavButton.css";
import { apiBaseURL } from "../../utils/constant";
import axios from "axios";
import {useContext, useEffect, useState} from "react";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";
import { ErrorContext } from "../Modal/modalContext";
import { ChatClientSocket } from "../../pages/Chat/Chat-client";
import {AuthContext} from "../Auth/auth.context";

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

export function PlayButton(props: { text: string; link: string }) {
  return (
    <Link to={props.link} className="playButton">
      {props.text}
    </Link>
  );
}

export function DisconnectButton(props: { callback?: () => void }) {
  const { setAuthed } = useContext(AuthContext);

  const handleDisconnect = async () => {
    if (props.callback) props.callback();

    const token: string | null = localStorage.getItem("token");
    if (!token) {
      await axios.put(apiBaseURL + "user/disconnect");
    }

    ChatClientSocket.disconnect();
    setAuthed(false);
    localStorage.clear();
    window.location.reload();

    await axios.put(apiBaseURL + "auth/disconnect", null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

function BellNotif({hasNotifs, setHasNotifs}: { hasNotifs: boolean, setHasNotifs: (value: boolean) => void}) {
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  useEffect(() => {
    const fetchNotifs = async () => {
      let token = localStorage.getItem("token");
      if (token) {
        await axios
          .get(apiBaseURL + "user/notifs", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            if (res.data) setHasNotifs(true);
          })
          .catch((error) => {
            if (error.response === undefined) {
              setErrorMessage("Error unknown...");
            } else if (error.response.status === 403) {
              localStorage.clear();
              setAuthed(false);
              setErrorMessage("Session expired, please login again!");
              return <Navigate to={"/"} />;
            } else setErrorMessage(error.response.data.message + "!");
          });
      } else {
        setAuthed(false);
        setErrorMessage("Session expired, please login again!");
        return <Navigate to={"/"} />;
      }
    };

    fetchNotifs().then(() => {});

    const notifHandler = () => {
      setHasNotifs(true);
    };

    ChatClientSocket.onNotificationEvent(notifHandler);

    return () => {
      ChatClientSocket.offNotificationEvent(notifHandler);
    }
  }, []);

  const logo: string = hasNotifs ? notifsLogoOn : notifsLogo;

  return (
    <img src={logo} alt={"logo notif"} width={45} height={45}></img>
  );
}

export function Notification() {
  const [hasNotifs, setHasNotifs] = useState(false);

  return (
    <Link to={`/notifications`} className="notifs" onClick={() => {setHasNotifs(false)}} >
      <BellNotif hasNotifs={hasNotifs} setHasNotifs={setHasNotifs}/>
      Notifs
    </Link>
  );
}
