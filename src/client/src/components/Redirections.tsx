import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./Redirections.css";
import Footer from "./Footer/Footer";
import {
  defaultFormState,
  FormContext,
  AuthContext,
  defaultAuthState,
} from "./Auth/dto";
import { AuthForms } from "./Auth/Forms";

function Redirections() {
  const [loginForm, setLoginForm] = useState(defaultFormState.loginForm);
  const [signupForm, setSignupForm] = useState(defaultFormState.signupForm);
  const [codeForm, setCodeForm] = useState(defaultFormState.codeForm);
  const [chatForm, setChatForm] = useState(defaultFormState.chatForm);
  const [authToken, setAuthToken] = useState(defaultAuthState.authed);

  return (
    <div className="redirs">
      <AuthContext.Provider
        value={{ authed: authToken, setAuthToken: setAuthToken }}
      >
        <FormContext.Provider
          value={{ loginForm, setLoginForm, signupForm, setSignupForm, codeForm, setCodeForm, chatForm, setChatForm }}
        >
          <AuthForms />
        </FormContext.Provider>
        <Outlet />
      </AuthContext.Provider>
      <Footer />
    </div>
  );
}

export default Redirections;
