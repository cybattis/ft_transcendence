import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { UserData } from "../Profile/user-data";
import PrivateGameChat from "../Chat/PrivateGameChat";

export function Game() {
  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());

  return (
    <div>
      <MultiplayerPong
        width={800}
        height={400}
        paddleColor={rgb}
      />
      <PrivateGameChat />
    </div>
  );
}
