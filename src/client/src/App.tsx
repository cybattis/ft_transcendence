import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";

export interface FormProps {
  loginFormCallback: (value: any) => void;
  signupFormCallback: (value: any) => void;
}

export interface LoggedInProps {
  loginFormCallback: (value: any) => void;
  loggedInCallback: (value: any) => void;
}

export interface Authed {
  authed: boolean;
}

export interface SetAuthed {
  authCallback: (value: any) => void;
}

function App() {
  const [loginFormState, setLoginFormState] = useState(false);
  const [signupFormState, setSignupFormState] = useState(false);
  const [authed, setAuthed] = useState(false);

  function AuthForms() {
    return (
      <>
        {loginFormState ? (
          <Login
            loggedInCallback={setAuthed}
            loginFormCallback={setLoginFormState}
            authed={authed}
          />
        ) : signupFormState ? (
          <Signup />
        ) : null}
      </>
    );
  }

  return (
    <div className="app">
      <NavBar
        loginFormCallback={setLoginFormState}
        signupFormCallback={setSignupFormState}
        authed={authed}
        authCallback={setAuthed}
      />
      <AuthForms />
      <Outlet context={authed} />
      <Footer />
    </div>
  );
}

export default App;
