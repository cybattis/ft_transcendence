import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import { AuthProps } from "../../App";
import React from "react";

export default function NavBar(authProps: AuthProps) {
  const navStyle = {
    display: "flex",
    flexDirection: "row" as "row",
    height: "3.5em",

    fontWeight: "bold",
    alignItems: "center",
  };

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        authProps.loginCallback(false);
        authProps.signupCallback(false);
      }
    },
    false
  );

  return (
    <nav style={navStyle}>
      <LeftMenu />
      <RightMenu
        loginCallback={authProps.loginCallback}
        signupCallback={authProps.signupCallback}
      />
    </nav>
  );
}
