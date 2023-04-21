import React from "react";
import "./RightMenu.css";
import logo from "../../resource/signin-logo.svg";
import {AuthProps} from "../../pages/Home/Home";

export default function RightMenu(props: AuthProps ) {
  return (
    <div className="rightMenu">
      <button className="login-button" onClick={
          () => {
              props.loginCallback(true);
              props.signupCallback(false);
          }}>
        Login
      </button>
      <button className="signup-button" onClick={
          () => {
              props.signupCallback(true);
              props.loginCallback(false);
          }}>
        <img className="logo-signin" src={logo} alt="logo" />
        SignUp
      </button>
    </div>
  );
}
