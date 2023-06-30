import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./NavBar.css";
import "./NavButton.css";
import logo from "../../resource/signin-logo.svg";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";
import { AuthContext, FormContext, NotifContext } from "../Auth/dto";
import { Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "../../type/client.type";
import { apiBaseURL } from "../../utils/constant";
import { DisconnectButton, NavButton } from "./NavButton";

function Unlogged() {
  const logoSignup = {
    marginRight: "4px",
  };

  const { setLoginForm, setSignupForm } = useContext(FormContext);

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

function BellNotif() {
  //Marche que quan user est dans menu(websocket que la ou y chat change ca)
  const { notif, setNotif } = useContext(NotifContext);

  const fetchNotifs = async () => {
    let JWTToken = localStorage.getItem("token");
    await axios
      .get(apiBaseURL + "user/notifs", {
        headers: { Authorization: `Bearer ${JWTToken}` },
      })
      .then((res) => {
        if (res.data) setNotif(true);
      });
  };

  fetchNotifs().then(() => {});

  if (!notif)
    return (
      <img src={notifsLogo} alt={"logo notif"} width={45} height={45}></img>
    );
  return (
    <img src={notifsLogoOn} alt={"logo notif"} width={45} height={45}></img>
  );
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
      await axios.put(apiBaseURL + "user/disconnect", id, {});
    }

    localStorage.clear();

    await axios.put(apiBaseURL + "auth/disconnect", id, {
      headers: {
        token: token,
      },
    });
  };

  return (
    <>
      <Link to={`/notifications/${decoded?.id}`} className="notifs">
        <BellNotif />
        Notifs
      </Link>
      <NavButton content={"Profile"} link={`/profile/${decoded?.id}`} />
      <NavButton content={"Settings"} link={"/settings"} />
      <DisconnectButton callback={handleDisconnect} />
    </>
  );
}

export default function RightMenu() {
  const { authed } = useContext(AuthContext);

  return (
    <div className={"rightMenu"}>{!authed ? <Unlogged /> : <Logged />}</div>
  );
}
