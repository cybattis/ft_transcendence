import { useContext } from "react";
import { AuthContext } from "../components/Auth/auth.context";
import { useNavigate } from "react-router-dom";
import { PopupContext } from "../components/Modal/Popup.context";
import { Navigation } from "../utils/navigation";

export interface TerminateSessionFunction {
  (): void;
}

export function useTokenSession(): TerminateSessionFunction {
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(PopupContext);
  const navigate = useNavigate();

  function terminateSession(): void {
    Navigation.disconnect();
    setAuthed(false);
    setErrorMessage("Your session has expired, please log in again.");
    navigate("/");
  }

  return terminateSession;
}
