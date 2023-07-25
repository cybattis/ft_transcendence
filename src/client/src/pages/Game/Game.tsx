import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { UserData } from "../Profile/user-data";

export function Game() {
  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());

  return (
    <MultiplayerPong name={"BESTBESTBEST"} width={800} height={400} paddleColor={rgb}/>
  );
}
