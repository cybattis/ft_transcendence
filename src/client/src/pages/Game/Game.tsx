import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import PrivateGameChat from "../Chat/PrivateGameChat";
import "./Game.css"

export function Game() {
  return (
    <div className="gamePage">
      <MultiplayerPong name={"BESTBESTBEST"} width={1000} height={600}/>
      <div className="chatBox">
        <div>INFOS JOUEURS</div>
        <PrivateGameChat />
      </div>
    </div>
  );
}
