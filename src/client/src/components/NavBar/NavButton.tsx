import { Link, Navigate } from "react-router-dom";
import "./NavButton.css";
import { apiBaseURL } from "../../utils/constant";
import axios from "axios";
import { useContext, useEffect } from "react";
import { AuthContext, NotifContext } from "../Auth/dto";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";
import { ErrorContext } from "../Modal/modalContext";

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
  const { setAuthToken } = useContext(AuthContext);

  const handleDisconnect = async () => {
    if (props.callback) props.callback();

    const token: string | null = localStorage.getItem("token");
    if (!token) {
      await axios.put(apiBaseURL + "user/disconnect");
    }

    setAuthToken(null);
    localStorage.clear();

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

function BellNotif() {
  //Marche que quan user est dans menu(websocket que la ou y chat change ca)
  const { notif, setNotif } = useContext(NotifContext);
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifs = async () => {
      let JWTToken = localStorage.getItem("token");
      await axios
        .get(apiBaseURL + "user/notifs", {
          headers: { Authorization: `Bearer ${JWTToken}` },
        })
        .then((res) => {
          if (res.data) setNotif(true);
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
    };

    fetchNotifs().then(() => {});
  }, []);

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  if (!notif)
    return (
      <img src={notifsLogo} alt={"logo notif"} width={45} height={45}></img>
    );
  return (
    <img src={notifsLogoOn} alt={"logo notif"} width={45} height={45}></img>
  );
}

export function Notification(props: { id: string | null }) {
  if (!props.id) return null;

  return (
    <Link to={`/notifications/${props.id}`} className="notifs">
      <BellNotif />
      Notifs
    </Link>
  );
}
