import Logo from "../Logo/Logo";
import "./Footer.css";
import { useEffect, useState } from "react";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { MatchmakingPlayerStatus, MatchmakingPlayerStatusDTO } from "../../game/networking/types";
import { Navigation } from "../../utils/navigation";
import { MatchmakingState } from "../../utils/matchmaking-states";

export default function Footer() {
  const [state, setState] = useState<MatchmakingPlayerStatusDTO>({ status: MatchmakingPlayerStatus.NONE });

  useEffect(() => {
    MatchmakingClient.getMatchmakingStatus()
      .then(setState)
      .catch((err) => {});
    MatchmakingClient.onSync(setState);
    MatchmakingState.onMatchmakingStateChange(setState);

    function resetState() { setState({ status: MatchmakingPlayerStatus.NONE }); }
    MatchmakingClient.onGameStarted(resetState);

    return () => {
      Navigation.offPageChange(resetState);
      MatchmakingClient.offSync(setState);
      MatchmakingClient.offGameStarted(resetState);
      MatchmakingState.offMatchmakingStateChange(setState);
    }
  }, []);

  let cssClass = "div-Footer";
  if (state.status === MatchmakingPlayerStatus.SEARCHING_CASUAL || state.status === MatchmakingPlayerStatus.SEARCHING_RANKED)
    cssClass += "-searching";
  else if (state.status === MatchmakingPlayerStatus.FOUND_CASUAL || state.status === MatchmakingPlayerStatus.FOUND_RANKED)
    cssClass += "-found";
  else if (state.status === MatchmakingPlayerStatus.WAITING_CASUAL || state.status === MatchmakingPlayerStatus.WAITING_RANKED)
    cssClass += "-waiting";

  return (
    <div className={cssClass}>
      <div className="mylogo">
        <Logo />
      </div>
      <div className="msg">©BigPong, Inc. 2023.</div>
    </div>
  );
}
