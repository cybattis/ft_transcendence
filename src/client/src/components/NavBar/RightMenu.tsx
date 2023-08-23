import React, { useContext } from "react";
import "./NavBar.css";
import "./NavButton.css";
import logo from "../../resource/signin-logo.svg";
import { AuthContext } from "../Auth/auth.context";
import { FormContext, FormState } from "../Auth/form.context";
import { DisconnectButton, NavButton } from "./NavButton";
import { Notification } from "./NavButton";
import {removeMultiplayerGame} from "../../game/PongManager";
import {MultiplayerClient} from "../../game/networking/multiplayer-client";

function Unlogged() {
  const { setFormState } = useContext(FormContext);

  const logoSignup = {
    marginRight: "4px",
  };

  function toggleLoginForm() {
    setFormState(FormState.LOGIN);
  }

  function toggleSignupForm() {
    setFormState(FormState.SIGNUP);
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
  function handlePageChange() {
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
  }

  return (
    <>
      <Notification />
      <NavButton content={"Profile"} link={"/my-profile"} callback={handlePageChange} />
      <NavButton content={"Settings"} link={"/settings"} callback={handlePageChange} />
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
