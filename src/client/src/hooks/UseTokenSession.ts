import { useContext } from "react";
import { AuthContext } from "../components/Auth/auth.context";
import { ErrorContext } from "../components/Modal/modalContext";
import { useNavigate } from "react-router-dom";

export interface TerminateSessionFunction {
  (): void;
}

export function useTokenSession(): TerminateSessionFunction {
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const navigate = useNavigate();

  function terminateSession(): void {
    localStorage.removeItem("token");
    setAuthed(false);
    setErrorMessage("Your session has expired, please log in again.");
    navigate("/");
  }

  return terminateSession;
}