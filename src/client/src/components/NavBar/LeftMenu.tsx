import "./NavBar.css";
import { NavButton, PlayButton } from "./NavButton";
import { AuthContext } from "../Auth/auth.context";
import { useContext } from "react";
import {removeMultiplayerGame} from "../../game/PongManager";
import {MultiplayerClient} from "../../game/networking/multiplayer-client";

function Unlogged() {
  return <NavButton content={"About"} link={"/about"} />;
}

function Logged() {
  return (
    <>
      <NavButton content={"About"} link={"/about"}/>
      <PlayButton text={"Play"} link={"/"}/>
      <NavButton content={"Ranking"} link={"/leaderboard"}/>
    </>
  );
}

export default function LeftMenu() {
  const { authed } = useContext(AuthContext);

  return (
    <div className={"left-menu"}>
      <div className={"leftButtons"}>
        {authed ? <Logged /> : <Unlogged />}
      </div>
    </div>
  );
}
