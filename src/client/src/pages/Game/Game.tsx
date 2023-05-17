import axios from "axios";
import {
  GameBodyDto,
  GameMode,
  GameStatus,
  GameType,
} from "../../type/game.type";

export function Game() {
  const data: GameBodyDto = {
    type: GameType.CASUAL,
    mode: GameMode.V1,
    players: [1, 2],
    scoreP1: 11,
    scoreP2: 7,
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
    <div>
      <h1>Game</h1>
      <button onClick={createGame}>Create game</button>
    </div>
  );
}
