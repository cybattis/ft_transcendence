import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import PrivateGameChat from "../Chat/PrivateGameChat";

export function Game() {
  return (
    <>
      <MultiplayerPong name={"BESTBESTBEST"} width={800} height={400}/>
      <PrivateGameChat />
    </>
  );
}
