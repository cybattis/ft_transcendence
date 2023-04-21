import Logo from "../Logo/Logo";
import "./footer.css";

export default function Footer() {
  return (
    <div className="div-Footer">
      <div className="mylogo">
        <Logo />
      </div>
      <p className="msg">©BigPong, Inc. 2023. We love our users!</p>
    </div>
  );
}
