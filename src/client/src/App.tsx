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
  SocketContext,
  defaultSocketState,
  NotifContext
} from "./components/Auth/dto";
import { AuthForms } from "./components/Auth/Forms";
import { ErrorModal } from "./components/Modal/ErrorModal";
import {
  defaultErrorContext,
  ErrorContext,
} from "./components/Modal/modalContext";

function App() {
  const [loginForm, setLoginForm] = useState(defaultFormState.loginForm);
  const [signupForm, setSignupForm] = useState(defaultFormState.signupForm);
  const [codeForm, setCodeForm] = useState(defaultFormState.signupForm);
  const [authToken, setAuthToken] = useState(defaultAuthState.authed);
  const [notif, setNotif] = useState(defaultNotifState.notif);
  const [socketId, setSocketId] = useState(defaultSocketState.socketId);
  const [errorMessage, setErrorMessage] = useState(
    defaultErrorContext.errorMessage
  );

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
            <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
              <NavBar />
              <SocketContext.Provider
                value={{ socketId: socketId, setSocketId: setSocketId }}
              >
                <Outlet />
              </SocketContext.Provider>
              <AuthForms />
              <ErrorModal
                error={errorMessage}
                onClose={() => setErrorMessage("")}
              />
            </ErrorContext.Provider>
          </FormContext.Provider>
        </AuthContext.Provider>
      </NotifContext.Provider>
      <Footer />
    </div>
  );
}

export default App;
