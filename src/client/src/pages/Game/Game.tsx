import axios from "axios";
import {
  GameBodyDto,
  GameMode,
  GameStatus,
  GameType,
} from "../../type/game.type";
import { useLocation } from "react-router-dom";

export function Game() {
  const location = useLocation();
  const props = location.state;

  const data: GameBodyDto = {
    type: props.type as GameType,
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
    <div>
      <h1>Game</h1>
      <button onClick={createGame}>Create game</button>
    </div>
  );
}
