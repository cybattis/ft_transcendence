import "./logo.css";
import logo from "../../resource/Logo.svg";

export default function Logo() {
  return (
    <div className="app-logo">
      <img src={logo} className="logo" alt="logo" width={32} height={32} />
      <div className="logo-title">PongFever</div>
    </div>
  );
}
