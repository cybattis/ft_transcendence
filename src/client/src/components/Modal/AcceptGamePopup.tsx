import "../Auth/Auth.css";
import Logo from "../Logo/Logo";
import React, { ReactNode, useEffect, useState } from "react";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { MultiplayerClient } from "../../game/networking/multiplayer-client";
import { useNavigate } from "react-router-dom";

export function AcceptGamePopup({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const opponentName = MatchmakingClient.getOpponentInfos().nickname;

  useEffect(() => {
    function show() {
      setVisible(true);
    }

    MatchmakingClient.ongameInviteAccepted(show);

    return () => {
      MatchmakingClient.offgameInviteAccepted(show);
    }
  }, []);

  function acceptGame() {
    navigate("/game");
    setVisible(false);
  }

  function declineGame() {
    MultiplayerClient.quitGame();
    setVisible(false);
  }

  return (
    <>
      {children}
      {visible && (
        <div className="background">
          <div className="authForm">
            <Logo />
            <div className="desc">
              {opponentName} accepted your game request!
            </div>
            <button className={"playButton"} onClick={acceptGame}>Play</button>
            <button className={"playButton"} onClick={declineGame}>Decline</button>
          </div>
        </div>
      )}
    </>
  );
}