import React, { useContext } from "react";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, FormContext } from "../Auth/dto";
import { Avatar } from "../Avatar";
import "./RightMenu.css";
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
  const navigate = useNavigate();

  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    console.log(e);
  }

  const handleDisconnect = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    navigate("/");
  };

  return (
    <>
      <Link to={`/profile/${decoded?.id}`}>
        <Avatar size="5%" />
      </Link>
      <button className="disconnect" onClick={handleDisconnect}>
        Disconnect
      </button>
    </>
  );
}

export default function RightMenu() {
  const rightMenu = {
    display: "flex",
    flexDirection: "row" as "row",
    maxWidth: "max-content",
    paddingRight: "6em",
  };

  const { authed } = useContext(AuthContext);

  return <div style={rightMenu}>{!authed ? <Unlogged /> : <Logged />}</div>;
}
