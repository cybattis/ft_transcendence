import Logo from "../Logo/Logo";
import "./footer.css";

export default function Footer() {
  return (
    <div className="div-Footer">
      <div className="mylogo">
        <Logo />
      </div>
      <div className="msg">©BigPong, Inc. 2023.</div>
    </div>
  );
}
