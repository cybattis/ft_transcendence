import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import React from "react";

export default function NavBar() {
  const navStyle = {
    display: "flex",
    flexDirection: "row" as "row",
    height: "3.5em",

    fontWeight: "bold",
    alignItems: "center",
  };

  return (
    <nav style={navStyle}>
      <LeftMenu />
      <RightMenu />
    </nav>
  );
}
