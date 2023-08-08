import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { apiBaseURL } from "../../utils/constant";
import { Navigate } from "react-router-dom";
import { PopupContext } from "../Modal/Popup.context";

interface AuthContextType {
  authed: boolean;
  isAuthing: boolean;
  tfaActivated: boolean;
  setAuthed: (authed: boolean) => void;
  setIsAuthing(authing: boolean): void;
  setTfaActivated: (authed: boolean) => void;
}

const defaultAuthContext: AuthContextType = {
  authed: false,
  isAuthing: false,
  tfaActivated: false,
  setAuthed: () => {},
  setIsAuthing: () => {},
  setTfaActivated: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [isAuthing, setIsAuthing] = useState<boolean>(!authed);
  const [tfaActivated, setTfaActivated] = useState<boolean>(false);
  const { setErrorMessage } = useContext(PopupContext);
  const token = localStorage.getItem("token");

  function setAuthedFunction(authed: boolean) {
    console.log("setting authed to :", authed);
    console.trace("setAuthedFunction");
    setIsAuthing(false);
    setAuthed(authed);
  }

  useEffect(() => {
    if (!token) {
      setIsAuthing(false);
      return;
    }

    axios
      .get(apiBaseURL + "auth/token-validation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAuthed(true);
        setIsAuthing(false);
      })
      .catch((error) => {
        setAuthed(false);
        setIsAuthing(false);
        setErrorMessage("Your session has expired, please log in again.");
        localStorage.removeItem("token");
        return <Navigate to="/" />;
      });
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authed,
        isAuthing,
        tfaActivated,
        setAuthed: setAuthedFunction,
        setIsAuthing,
        setTfaActivated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
