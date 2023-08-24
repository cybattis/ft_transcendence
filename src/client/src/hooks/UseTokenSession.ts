import { useContext } from "react";
import { AuthContext } from "../components/Auth/auth.context";
import { useNavigate } from "react-router-dom";
import { PopupContext } from "../components/Modal/Popup.context";
import { removeMultiplayerGame } from "../game/PongManager";
import { MultiplayerClient } from "../game/networking/multiplayer-client";
import { MatchmakingState } from "../utils/matchmaking-states";
import { MatchmakingPlayerStatus } from "../game/networking/types";
import { ChatClientSocket } from "../pages/Chat/Chat-client";
import { MatchmakingClient } from "../game/networking/matchmaking-client";
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
