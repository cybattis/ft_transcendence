import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { UserData } from "../Profile/user-data";
import PrivateGameChat from "../Chat/PrivateGameChat";
import "./Game.css"

export function Game() {
  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());

  return (
    <div className="gamePage">
      <MultiplayerPong
        name={"BESTBESTBEST"}
        width={800}
        height={400}
        paddleColor={rgb}
        />
      <div className="chatBox">
        <div>INFOS JOUEURS</div>
        <PrivateGameChat />
      </div>
    </div>
  );
}
