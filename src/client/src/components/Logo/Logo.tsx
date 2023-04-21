import "./logo.css";
import logo from "../../resource/Logo.svg";

export default function Logo() {
  return (
    <div className="div-Project">
      <img src={logo} className="logo" alt="logo" />
      <div className="title">PongFever</div>
    </div>
  );
}
