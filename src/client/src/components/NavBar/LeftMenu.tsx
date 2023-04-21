import { Link } from "react-router-dom";
import Logo from "../Logo/Logo";
import "./LeftMenu.css";

export default function LeftMenu() {
  return (
    <div className="leftMenu">
      <Logo />
      <div className="leftLinks">
        <Link className="navLink" to="/">
          Home
        </Link>
        <Link to="/about" className="navLink">
          About
        </Link>
        <Link to="/team" className="navLink">
          Team
        </Link>
      </div>
    </div>
  );
}
