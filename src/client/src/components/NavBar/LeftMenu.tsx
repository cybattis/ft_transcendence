import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
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
      <Link to="/">
        <Logo />
      </Link>
      <div className={"leftButtons"}>{!token ? <Unlogged /> : <Logged />}</div>
    </div>
  );
}
