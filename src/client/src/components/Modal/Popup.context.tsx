import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ErrorModal, InfoModal } from "./PopUpModal";
import { SocketManager } from "../../utils/socketManager";
import { Navigation } from "../../utils/navigation";
import { AuthContext } from "../Auth/auth.context";
import { useNavigate } from "react-router-dom";

interface PopupContextType {
  errorMessage: string;
  setErrorMessage: (value: string) => void;
  infoMessage: string;
  setInfoMessage: (value: string) => void;
}

export const defaultPopUpContext: PopupContextType = {
  errorMessage: "",
  setErrorMessage: () => {},
  infoMessage: "",
  setInfoMessage: () => {},
};

export const PopupContext =
  createContext<PopupContextType>(defaultPopUpContext);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const { setAuthed } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    SocketManager.onSocketErrorCallback(() => {
      Navigation.disconnect();
      setAuthed(false);
      setErrorMessage("Your session has expired, please log in again.");
      navigate("/");
    });

    return () => {
      SocketManager.offSocketErrorCallback();
    }
  });

  return (
    <PopupContext.Provider
      value={{ errorMessage, setErrorMessage, infoMessage, setInfoMessage }}
    >
      {children}
      <ErrorModal
        onClose={() => {
          setErrorMessage("");
        }}
      />
      <InfoModal
        onClose={() => {
          setInfoMessage("");
        }}
      />
    </PopupContext.Provider>
  );
}
