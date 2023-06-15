import React, { useContext } from "react";
import axios from "axios";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import notifsLogo from "../../resource/logo-notifications.png"
import { Link, Navigate } from "react-router-dom";
import { AuthContext, FormContext } from "../Auth/dto";
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

function Logged() {
  const { setAuthToken } = useContext(AuthContext);
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

  const logoNotifs = {
    width: "45px",
    height: "45px",
  }

  return (
    <>
      <Link to={`/notifications/${decoded?.id}`} className="notifs">
        <img style={logoNotifs} src={notifsLogo} />
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
