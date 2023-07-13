import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import navbarIcon from "../../resource/menu.png";
import { DisconnectButton, NavButton } from "./NavButton";
import jwt_decode from "jwt-decode";
import { JwtPayload } from "../../type/client.type";
import { Notification } from "./NavButton";
import { AuthContext, FormContext } from "../Auth/dto";
import logo from "../../resource/signin-logo.svg";

function MobileNavBar() {
  const [sidePanel, setSidePanel] = useState(false);
  const { authed } = useContext(AuthContext);
  const { setLoginForm, setSignupForm } = useContext(FormContext);

  let username: string = "";
  let id: string = ""

  try {
    const decoded: JwtPayload = jwt_decode(localStorage.getItem("token")!);
    if (decoded) username = decoded.username;
    else username = "";
    if (decoded) id = decoded.id;
    else id = "";
  } catch (e) {}

  function handleSidePanel() {
    setSidePanel(!sidePanel);
  }

  function toggleLoginForm() {
    setLoginForm(true);
    setSidePanel(!sidePanel);
  }

  function toggleSignupForm() {
    setSignupForm(true);
    setSidePanel(!sidePanel);
  }

  return (
    <nav className={"nav-style-mobile"}>
      <Link to="/">
        <Logo />
      </Link>
      <div className={"navbar-mobile-div"}></div>
      <Notification id={id} />
      {authed ? (
        <button className={"navbar-button"} onClick={handleSidePanel}>
          <img src={navbarIcon} alt="navbar icon" width={25} height={25} />
        </button>
      ) : null}
      {sidePanel && authed ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
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
      ) : !authed ? (
        <>
          <button className="login-button" onClick={toggleLoginForm}>
            Login
          </button>
          <button className="signup-button" onClick={toggleSignupForm}>
            <img src={logo} alt="logo" />
            SignUp
          </button>
        </>
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
