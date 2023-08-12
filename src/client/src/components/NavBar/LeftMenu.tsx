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
  function handlePageChange() {
    removeMultiplayerGame();
    MultiplayerClient.quitGame();
  }

  return (
    <>
      <NavButton content={"About"} link={"/about"} callback={handlePageChange} />
      <PlayButton text={"Play"} link={"/"} callback={handlePageChange} />
      <NavButton content={"Ranking"} link={"/leaderboard"} callback={handlePageChange} />
    </>
  );
}

export default function LeftMenu() {
  const { authed } = useContext(AuthContext);

  return (
    <div className={"leftMenu"}>
      <div className={"leftButtons"}>
        {authed ? <Logged /> : <Unlogged />}
      </div>
    </div>
  );
}
