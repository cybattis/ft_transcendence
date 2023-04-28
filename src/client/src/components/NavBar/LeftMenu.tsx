import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import "./NavBar.css";
import { Authed } from "../../App";

function Unlogged() {
  return (
    <>
      <Link to="/" className="leftLink">
        Home
      </Link>
      <Link to="about" className="leftLink">
        About
      </Link>
    </>
  );
}

function Logged() {
  const playLink = {
    display: "flex",
    width: "70px",
    height: "30px",
    margin: "0 10px 0 10px",
    padding: "0 5px",
    borderRadius: "8px",

    color: "white",
    backgroundColor: "var(--purple-wave)",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
  };

  return (
    <>
      <Link to="about" className="leftLink">
        About
      </Link>
      <Link to="/" style={playLink}>
        Play
      </Link>
      <Link to="/ranking" className="leftLink">
        Ranking
      </Link>
    </>
  );
}

export default function LeftMenu(props: Authed) {
  const leftMenu = {
    display: "flex",
    flex: "auto",
    paddingLeft: "6em",
  };

  const links = {
    display: "flex",
    alignItems: "center",
  };

  return (
    <div style={leftMenu}>
      <Link to="/">
        <Logo />
      </Link>
      <div style={links}>{!props.authed ? <Unlogged /> : <Logged />}</div>
    </div>
  );
}
