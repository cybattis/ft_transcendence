import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import React, { useContext, useEffect, useState } from "react";

import Logo from "../Logo/Logo";
import navbarIcon from "../../resource/menu.png";
import { DisconnectButton, NavButton } from "./NavButton";
import { Notification } from "./NavButton";
import logo from "../../resource/signin-logo.svg";
import {AuthContext} from "../Auth/auth.context";
import {FormContext, FormState} from "../Auth/form.context";
import { PageLink } from "../Navigation/PageLink";
import { Navigation } from "../../utils/navigation";

function MobileNavBar() {
  const [sidePanel, setSidePanel] = useState(false);
  const { authed } = useContext(AuthContext);
  const { setFormState } = useContext(FormContext);

  function hideSidePanel() {
    setSidePanel(false);
  }

  function toggleLoginForm() {
    setFormState(FormState.LOGIN);
    setSidePanel(false);
  }

  function toggleSignupForm() {
    setFormState(FormState.SIGNUP);
    setSidePanel(false);
  }

  useEffect(() => {
    Navigation.onPageChange(hideSidePanel);

    return () => {
      Navigation.offPageChange(hideSidePanel);
    }
  });

  return (
    <nav className={"nav-style-mobile"}>
      <PageLink to={"/"}>
        <Logo />
      </PageLink>
      <div className={"navbar-mobile-div"}></div>
      {authed ? (
        <>
          <Notification />
        </>
      ) : null}
      <button className={"navbar-button"} onClick={() => setSidePanel(!sidePanel)}>
        <img src={navbarIcon} alt="navbar icon" width={25} height={25} />
      </button>
      {sidePanel && authed ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
          />
          <NavButton
            content={"Play"}
            link={"/"}
          />
          <NavButton
            content={"Ranking"}
            link={"/leaderboard"}
          />
          <NavButton
            content={"Profile"}
            link={`/my-profile`}
          />
          <NavButton
            content={"Settings"}
            link={"/settings"}
          />
          <div
            style={{
              height: "1px",
              width: "100%",
              backgroundColor: "white",
              margin: "10px 0",
            }}
          >
            <DisconnectButton/>
          </div>
        </div>
      ) : !authed && sidePanel ? (
        <div className={"navbar-mobile-sidepanel"}>
          <NavButton
            content={"About"}
            link={"/about"}
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
        <PageLink to="/">
          <Logo />
        </PageLink>
        <LeftMenu />
        <RightMenu />
      </nav>
    </>
  );
}
