import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import notifsLogo from "../../resource/logo-notifications.png"
import notifsLogoOn from "../../resource/logo-notifications-on.png"
import { Link, Navigate } from "react-router-dom";
import { AuthContext, FormContext, NotifContext } from "../Auth/dto";
import jwt_decode from "jwt-decode";
import { Decoded } from "../../type/client.type";

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

function Img() {
  //Marche que quan user est dans menu(websocket que la ou y chat change ca)
  const { notif, setNotif } = useContext(NotifContext);
  const logoNotifs = {
    width: "45px",
    height: "45px",
  }

    const fetchNotifs = async () => {
      let JWTToken = localStorage.getItem("token");
      await axios.get("http://localhost:5400/user/notifs", {
        headers: { Authorization: `Bearer ${JWTToken}` },
      })
      .then(res => {
        if (res.data)
          setNotif(true);
      });
    };

  fetchNotifs();

  if (notif === false)
    return <img style={logoNotifs} src={notifsLogo}></img>;
  return <img style={logoNotifs} src={notifsLogoOn}></img>
}

function Logged() {
  const { setAuthToken } = useContext(AuthContext);
  const { notif } = useContext(NotifContext);
  const [notifs, setNotifs] = useState(false);

  useEffect(() => {
    console.log(notif);
    if (notif === true)
      setNotifs(true);
  }, [notif]);

  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    console.log(e);
  }

  const handleDisconnect = async () => {
    let JWTToken = localStorage.getItem("token");
    localStorage.removeItem("token");
    setAuthToken(null);
    await axios.put("http://localhost:5400/user/disconnect", false, {
      headers: { Authorization: `Bearer ${JWTToken}` },
    });
  };

  return (
    <>
      <Link to={`/notifications/${decoded?.id}`} className="notifs">
        <div className="img"><Img /></div>
        Notifs
      </Link>
      <Link to={`/profile/${decoded?.id}`} className={"navLink"}>
        Profile
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
