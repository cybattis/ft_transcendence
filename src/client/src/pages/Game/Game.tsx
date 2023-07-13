import { AIOnlyPong } from "../../game/components/AIOnlyPong";
import axios from "axios";
import {
  GameBodyDto,
  GameMode,
  GameStatus,
  GameType,
} from "../../type/game.type";

export function Game() {
  const data: GameBodyDto = {
    type: GameType.RANKED,
    mode: GameMode.V1,
    ids: [2, 1],
    scoreP1: 7,
    scoreP2: 11,
    status: GameStatus.FINISHED,
  };

  async function createGame() {
    await axios
      .post("http://localhost:5400/game/create", data, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        console.log("Game created!");
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <>
      <button onClick={createGame}>Create game</button>
      <AIOnlyPong
        name={"BESTBESTBEST"}
        width={500}
        height={250}
        leftDifficulty={"Hard"}
        rightDifficulty={"Hard"}
      />
    </>
  );
}
