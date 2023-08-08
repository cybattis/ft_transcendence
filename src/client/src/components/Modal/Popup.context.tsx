import { createContext, ReactNode, useState } from "react";
import { ErrorModal, InfoModal } from "./PopUpModal";

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
