import React, { useContext } from "react";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import { useNavigate } from "react-router-dom";
import { AuthContext, FormContext } from "../Auth/dto";

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
  const naviguate = useNavigate();

  const handleDisconnect = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    naviguate("/");
  };

  return (
    <>
      <button className="" onClick={handleDisconnect}>
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
