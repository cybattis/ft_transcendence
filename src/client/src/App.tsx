import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import {
  defaultFormState,
  FormContext,
  AuthContext,
  defaultAuthState,
  defaultNotifState,
  NotifContext,
} from "./components/Auth/dto";
import { PopupProvider } from "./components/Modal/Popup.context";
import { AuthForms } from "./components/Auth/Forms";

function App() {
  const [loginForm, setLoginForm] = useState(defaultFormState.loginForm);
  const [signupForm, setSignupForm] = useState(defaultFormState.signupForm);
  const [codeForm, setCodeForm] = useState(defaultFormState.signupForm);
  const [authToken, setAuthToken] = useState(defaultAuthState.authed);
  const [notif, setNotif] = useState(defaultNotifState.notif);

  return (
    <div className="app" id={"background"}>
      <NotifContext.Provider value={{ notif: notif, setNotif: setNotif }}>
        <AuthContext.Provider
          value={{ authed: authToken, setAuthToken: setAuthToken }}
        >
          <FormContext.Provider
            value={{
              loginForm,
              setLoginForm,
              signupForm,
              setSignupForm,
              codeForm,
              setCodeForm,
            }}
          >
            <PopupProvider>
              <NavBar />
              <Outlet />
              <AuthForms />
            </PopupProvider>
          </FormContext.Provider>
        </AuthContext.Provider>
      </NotifContext.Provider>
      <Footer />
    </div>
  );
}

export default App;
