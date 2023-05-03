import React from "react";
import "./NavBar.css";
import logo from "../../resource/signin-logo.svg";
import { Authed, LoginFormProps, SetAuthed, SignupFormProps } from "../../App";
import { useNavigate } from "react-router-dom";

function Unlogged(props: {
  onClickLogin: () => void;
  onClickSubmit: () => void;
}) {
  const logoSignup = {
    marginRight: "4px",
  };

  return (
    <>
      <button className="login-button" onClick={props.onClickLogin}>
        Login
      </button>
      <button className="signup-button" onClick={props.onClickSubmit}>
        <img style={logoSignup} src={logo} alt="logo" />
        SignUp
      </button>
    </>
  );
}

function Logged(props: SetAuthed) {
  const naviguate = useNavigate();

  const handleDisconnect = () => {
    props.authCallback(false);
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

export default function RightMenu(props: LoginFormProps & SignupFormProps & Authed & SetAuthed) {
  const rightMenu = {
    display: "flex",
    flexDirection: "row" as "row",
    maxWidth: "max-content",
    paddingRight: "6em",
  };

  return (
    <div style={rightMenu}>
      {!props.authed ? (
        <Unlogged
          onClickLogin={() => {
            props.loginFormCallback(true);
            props.signupFormCallback(false);
          }}
          onClickSubmit={() => {
            props.signupFormCallback(true);
            props.loginFormCallback(false);
          }}
        />
      ) : (
        <Logged authCallback={props.authCallback} />
      )}
    </div>
  );
}
