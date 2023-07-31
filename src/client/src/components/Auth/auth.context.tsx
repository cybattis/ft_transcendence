import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import axios from "axios";
import {apiBaseURL} from "../../utils/constant";
import {Navigate} from "react-router-dom";
import {ErrorContext} from "../Modal/modalContext";
import {HomeUnlogged} from "../../pages/Home/Home";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

interface AuthContextType {
  authed: boolean,
  tfaActivated: boolean,
  setAuthed: (authed: boolean) => void,
  setTfaActivated: (authed: boolean) => void,
}

const defaultAuthContext: AuthContextType = {
  authed: false,
  tfaActivated: false,
  setAuthed: () => {},
  setTfaActivated: () => {},
}

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthContextProvider({children}: {children: ReactNode}) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [tfaActivated, setTfaActivated] = useState<boolean>(false);
  const {setErrorMessage} = useContext(ErrorContext);
  const token = localStorage.getItem("token");

  function setAuthedFunction(authed: boolean) {
    console.log("setting authed to :", authed);
    console.trace("setAuthedFunction");
    setAuthed(authed);
  }

  useEffect(() => {
    if (!token) {
      console.log("no token, returning");
      return;
    }

    axios
      .get(apiBaseURL + "auth/token-validation", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }).then((res) => {
      setAuthed(true);
      console.log("token valid");
    }).catch((error) => {
      setAuthed(false);
      console.log("token invalid");
      setErrorMessage("Your session has expired, please log in again.");
      localStorage.removeItem("token");
      return <Navigate to="/"/>;
    });
  }, [token, authed]);

  console.log("end of use effect auth context");

  return (
    <AuthContext.Provider value={{authed, tfaActivated, setAuthed: setAuthedFunction, setTfaActivated}}>
      {children}
    </AuthContext.Provider>
  );
}

