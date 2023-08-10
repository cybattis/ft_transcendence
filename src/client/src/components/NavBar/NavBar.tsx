import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import navbarIcon from "../../resource/menu.png";
import { DisconnectButton, NavButton, PlayButton } from "./NavButton";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "../../type/client.type";
import { Notification } from "./NavButton";
import logo from "../../resource/signin-logo.svg";
import {AuthContext} from "../Auth/auth.context";
import {FormContext, FormState} from "../Auth/form.context";

function MobileNavBar() {
  const [sidePanel, setSidePanel] = useState(false);
  const { authed } = useContext(AuthContext);
  const { setFormState } = useContext(FormContext);

  let username: string = "";

  const token = localStorage.getItem("token");
  if (token) {
    const decoded: JwtPayload = jwt_decode(token);
    if (decoded) username = decoded.nickname;
    else username = "";
  }

  function handleSidePanel() {
    setSidePanel(!sidePanel);
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
      <Link to="/">
        <Logo />
      </Link>
      <div className={"navbar-mobile-div"}></div>
      {authed ? (
        <>
          <Notification />
        </>
      ) : null}
      <button className={"navbar-button"} onClick={handleSidePanel}>
        <img src={navbarIcon} alt="navbar icon" width={25} height={25} />
      </button>
      {sidePanel && authed ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
            callback={handleSidePanel}
          />
          <NavButton
            content={"Play"}
            link={"/"}
            callback={handleSidePanel}
          />
          <NavButton
            content={"Ranking"}
            link={"/leaderboard"}
            callback={handleSidePanel}
          />
          <NavButton
            content={"Profile"}
            link={`/profile/${username}`}
            callback={handleSidePanel}
          />
          <NavButton
            content={"Settings"}
            link={"/settings"}
            callback={handleSidePanel}
          />
          <div
            style={{
              height: "1px",
              width: "100%",
              backgroundColor: "white",
              margin: "10px 0",
            }}
          >
            <DisconnectButton callback={handleSidePanel} />
          </div>
        </div>
      ) : !authed && sidePanel ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
            callback={handleSidePanel}
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
  return (
    <>
      <MobileNavBar />
      <nav className={"nav-style"}>
        <Link to="/">
          <Logo />
        </Link>
        <LeftMenu />
        <RightMenu />
      </nav>
    </>
  );
}
