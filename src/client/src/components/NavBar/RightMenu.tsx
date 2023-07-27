import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./NavBar.css";
import "./NavButton.css";
import logo from "../../resource/signin-logo.svg";
import { AuthContext, FormContext, NotifContext } from "../Auth/dto";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "../../type/client.type";
import { DisconnectButton, NavButton } from "./NavButton";
import { Notification } from "./NavButton";
import { apiBaseURL } from "../../utils/constant";
import notifsLogo from "../../resource/logo-notifications.png";
import notifsLogoOn from "../../resource/logo-notifications-on.png";

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

function Logged() {
  const { notif } = useContext(NotifContext);
  const [notifs, setNotifs] = useState(false);

  useEffect(() => {
    console.log(notif);
    if (notif) setNotifs(true);
  }, []);

  let username: string | null = null;

  try {
    const decoded: JwtPayload = jwt_decode(localStorage.getItem("token")!);
    username = decoded.nickname;
  } catch (e) {
    console.log("Error: Invalid token");
  }

  return (
    <>
      <Notification />
      <NavButton content={"Profile"} link={`/profile/${username}`} />
      <NavButton content={"Settings"} link={"/settings"} />
      <DisconnectButton />
    </>
  );
}

export default function RightMenu() {
  const { authed } = useContext(AuthContext);

  return (
    <div className={"rightMenu"}>{!authed ? <Unlogged /> : <Logged />}</div>
  );
}
