import React, { useContext } from "react";
import axios from "axios";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import { Link } from "react-router-dom";
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
  const id = localStorage.getItem("id");

  const handleDisconnect = async () => {
    localStorage.removeItem("id");
    setAuthToken(null);

    const token: string | null = localStorage.getItem("token");
    if (!token) {
      await axios.put("http://localhost:5400/user/disconnect", id, {});
    }

    localStorage.clear();

    await axios.put("http://localhost:5400/auth/disconnect", id, {
      headers: {
        token: token,
      },
    });
  };

  return (
    <>
      <Link to={`/profile/${id}`} className={"navLink"}>
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
