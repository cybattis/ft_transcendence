import { Link } from "react-router-dom";
import "./NavButton.css";

export function NavButton(props: { link: string; content?: string | any }) {
  return (
    <Link to={props.link} className="navLink">
      {props.content}
    </Link>
  );
}

export function PlayButton(props: { text: string; link: string }) {
  return (
    <Link to={props.link} className="playButton">
      {props.text}
    </Link>
  );
}

export function DisconnectButton(props: { callback: any }) {
  return (
    <Link
      to="/"
      className="navLink"
      id={"disconnectButton"}
      onClick={props.callback}
    >
      Disconnect
    </Link>
  );
}
