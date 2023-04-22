import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";
import { useState } from "react";
import Login from "../Login/Login";
import Signup from "../Signup";

export interface AuthProps {
  loginCallback: (value: any) => void;
  signupCallback: (value: any) => void;
}

function HomePage() {
  return (
    <div className="home">
      <h1>PongFever</h1>
      <h3 className="desc">
        Come play to the new and fun multiplayer pong game !
      </h3>
      <div className="game"></div>
    </div>
  );
}

export default function Home() {
  const [loginState, setLoginState] = useState(false);
  const [signupState, setSignupState] = useState(false);

  return (
    <div className="full">
      <NavBar loginCallback={setLoginState} signupCallback={setSignupState} />
      {loginState ? <Login /> : signupState ? <Signup /> : null}
      <HomePage />
      <Footer />
    </div>
  );
}
