import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import navbarIcon from "../../resource/menu.png";
import { DisconnectButton, NavButton } from "./NavButton";
import jwt_decode from "jwt-decode";
import { TokenData } from "../../type/client.type";
import { Notification } from "./NavButton";
import logo from "../../resource/signin-logo.svg";
import {AuthContext} from "../Auth/auth.context";
import {FormContext, FormState} from "../Auth/form.context";
import {removeMultiplayerGame} from "../../game/PongManager";
import {MultiplayerClient} from "../../game/networking/multiplayer-client";

function MobileNavBar() {
  const [sidePanel, setSidePanel] = useState(false);
  const { authed } = useContext(AuthContext);
  const { setFormState } = useContext(FormContext);

  let username: string = "";

  const token = localStorage.getItem("token");
  if (token) {
    const decoded: TokenData = jwt_decode(token);
    if (decoded) username = decoded.nickname;
    else username = "";
  }

  function handlePageChange() {
    setSidePanel(!sidePanel);
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
  }

  function toggleLoginForm() {
    setFormState(FormState.LOGIN);
    setSidePanel(!sidePanel);
  }

  function toggleSignupForm() {
    setFormState(FormState.SIGNUP);
    setSidePanel(!sidePanel);
  }

  return (
    <nav className={"nav-style-mobile"}>
      <Link to="/" onClick={() => {
        removeMultiplayerGame();
        MultiplayerClient.quitGame();
      }}>
        <Logo />
      </Link>
      <div className={"navbar-mobile-div"}></div>
      {authed ? (
        <>
          <Notification />
        </>
      ) : null}
      <button className={"navbar-button"} onClick={handlePageChange}>
        <img src={navbarIcon} alt="navbar icon" width={25} height={25} />
      </button>
      {sidePanel && authed ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
            callback={handlePageChange}
          />
          <NavButton
            content={"Play"}
            link={"/"}
            callback={handlePageChange}
          />
          <NavButton
            content={"Ranking"}
            link={"/leaderboard"}
            callback={handlePageChange}
          />
          <NavButton
            content={"Profile"}
            link={`/profile/nickname/${username}`}
            callback={handlePageChange}
          />
          <NavButton
            content={"Settings"}
            link={"/settings"}
            callback={handlePageChange}
          />
          <div
            style={{
              height: "1px",
              width: "100%",
              backgroundColor: "white",
              margin: "10px 0",
            }}
          >
            <DisconnectButton callback={handlePageChange} />
          </div>
        </div>
      ) : !authed && sidePanel ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
            callback={handlePageChange}
          />
          <div
            style={{
              height: "1px",
              width: "100%",
              backgroundColor: "white",
              margin: "10px 0",
            }}
          >
            <button className="login-button" onClick={toggleLoginForm}>
              Login
            </button>
            <button className="signup-button" onClick={toggleSignupForm}>
              <img src={logo} alt="logo" />
              SignUp
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export default function NavBar() {
  function handlePageChange() {
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
  }

  return (
    <>
      <MobileNavBar />
      <nav className={"nav-style"}>
        <Link to="/" onClick={handlePageChange}>
          <Logo />
        </Link>
        <LeftMenu />
        <RightMenu />
      </nav>
    </>
  );
}
