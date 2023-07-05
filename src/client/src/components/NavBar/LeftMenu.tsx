import "./NavBar.css";
import { NavButton, PlayButton } from "./NavButton";

function Unlogged() {
  return <NavButton content={"About"} link={"/about"} />;
}

function Logged() {
  return (
    <>
      <NavButton content={"About"} link={"/about"} />
      <PlayButton text={"Play"} link={"/"} />
      <NavButton content={"Ranking"} link={"/leaderboard"} />
    </>
  );
}

export default function LeftMenu() {
  const token = localStorage.getItem("token");

  return (
    <div className={"leftMenu"}>
      <div className={"leftButtons"}>{!token ? <Unlogged /> : <Logged />}</div>
    </div>
  );
}
