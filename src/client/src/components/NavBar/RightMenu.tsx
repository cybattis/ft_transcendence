import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";
import { AuthContext, FormContext, NotifContext } from "../Auth/dto";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "../../type/client.type";

function Unlogged() {
  const logoSignup = {
    marginRight: "4px",
  };

  const { loginForm, setLoginForm, setSignupForm } = useContext(FormContext);

  function toggleLoginForm() {
    setLoginForm(true);
  }

  function toggleSignupForm() {
    setSignupForm(true);
  }

  return (
    <>
      <button className="login-button" onClick={toggleLoginForm}>
        Login
      </button>
      <button className="signup-button" onClick={toggleSignupForm}>
        <img style={logoSignup} src={logo} alt="logo" />
        SignUp
      </button>
    </>
  );
}

function Img() {
  //Marche que quan user est dans menu(websocket que la ou y chat change ca)
  const { notif, setNotif } = useContext(NotifContext);
  const logoNotifs = {
    width: "45px",
    height: "45px",
  };

  const fetchNotifs = async () => {
    let JWTToken = localStorage.getItem("token");
    await axios
      .get("http://" + process.env["REACT_APP_API_IP"] + ":5400/user/notifs", {
        headers: { Authorization: `Bearer ${JWTToken}` },
      })
      .then((res) => {
        if (res.data) setNotif(true);
      });
  };

  fetchNotifs().then(() => {});

  if (!notif)
    return <img style={logoNotifs} src={notifsLogo} alt={"logo notif"}></img>;
  return <img style={logoNotifs} src={notifsLogoOn} alt={"logo notif"}></img>;
}

function Logged() {
  const { setAuthToken } = useContext(AuthContext);
  const { notif } = useContext(NotifContext);
  const [notifs, setNotifs] = useState(false);
  const id = localStorage.getItem("id");

  useEffect(() => {
    console.log(notif);
    if (notif) setNotifs(true);
  }, [notif]);

  let decoded: JwtPayload | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    console.log(e);
  }

  const handleDisconnect = async () => {
    localStorage.removeItem("id");
    setAuthToken(null);

    const token: string | null = localStorage.getItem("token");
    if (!token) {
      await axios.put(
        "http://" + process.env["REACT_APP_API_IP"] + ":5400/user/disconnect",
        id,
        {}
      );
    }

    localStorage.clear();

    await axios.put(
      "http://" + process.env["REACT_APP_API_IP"] + ":5400/auth/disconnect",
      id,
      {
        headers: {
          token: token,
        },
      }
    );
  };

  return (
    <>
      <Link to={`/notifications/${decoded?.id}`} className="notifs">
        <div className="img">
          <Img />
        </div>
        Notifs
      </Link>
      <Link to={`/profile/${decoded?.id}`} className={"navLink"}>
        Profile
      </Link>
      <Link to={`/settings`} className={"navLink"}>
        Settings
      </Link>
      <Link to="/" className="disconnect" onClick={handleDisconnect}>
        Disconnect
      </Link>
    </>
  );
}

export default function RightMenu() {
  const { authed } = useContext(AuthContext);

  return (
    <div className={"rightMenu"}>{!authed ? <Unlogged /> : <Logged />}</div>
  );
}
