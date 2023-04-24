import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Login from "./components/Login/Login";
import Signup from "./components/Signup";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";

export interface AuthProps {
  loginCallback: (value: any) => void;
  signupCallback: (value: any) => void;
}

function App() {
  const [loginState, setLoginState] = useState(false);
  const [signupState, setSignupState] = useState(false);

  return (
    <div className="app">
      <NavBar loginCallback={setLoginState} signupCallback={setSignupState} />
      <Outlet />
      <Footer />
      {loginState ? <Login /> : signupState ? <Signup /> : null}
    </div>
  );
}

export default App;
