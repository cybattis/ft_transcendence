import React from "react";
import { Link } from "react-router-dom";
import "./RightMenu.css";
import logo from "../../resource/signin-logo.svg";

export default function RightMenu() {
  return (
    <div className="rightMenu">
      <Link to="/login" className="login-button">
        Login
      </Link>
      <Link to="/signup" className="signup-button">
        <img className="logo-signin" src={logo} alt="logo" />
        SignUp
      </Link>
    </div>
  );
}
