import React, { useEffect } from "react";
import { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import {
  defaultFormState,
  FormContext,
  AuthContext,
  defaultAuthState,
} from "./components/Auth/dto";
import { AuthForms } from "./components/Auth/Forms";
import { io, Socket } from "socket.io-client";

type ContextType = { send: (value: string) => void; messages: string[] };

function App() {
  const [loginForm, setLoginForm] = useState(defaultFormState.loginForm);
  const [signupForm, setSignupForm] = useState(defaultFormState.signupForm);
  const [authed, setAuth] = useState(defaultAuthState.authed);

  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<String[]>([]);

  const send = (value: string) => {
    socket?.emit("message", value);
    console.log(value);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:5400");
    setSocket(newSocket);
  }, [setSocket]);

  const messageListener = (message: string) => {
    setMessages([...messages, message]);
    console.log("Listener: ", message);
  };

  useEffect(() => {
    socket?.on("message", messageListener);
    return () => {
      socket?.off("message", messageListener);
    };
  }, [messageListener]);

  return (
    <div className="app">
      <AuthContext.Provider value={{ authed, setAuth }}>
        <FormContext.Provider
          value={{ loginForm, setLoginForm, signupForm, setSignupForm }}
        >
          <NavBar />
          <AuthForms />
        </FormContext.Provider>
        <Outlet context={{ send, messages }} />
      </AuthContext.Provider>
      <Footer />
    </div>
  );
}

export function useSend() {
  return useOutletContext<ContextType>();
}

export default App;
