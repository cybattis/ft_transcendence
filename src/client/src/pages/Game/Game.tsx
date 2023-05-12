import axios from "axios";

export enum GameType {
  PRACTICE = "Practice",
  CASUAL = "Casual",
  RANKED = "Ranked",
}

export enum GameMode {
  V1 = "1v1",
  V2 = "2v2",
}

export interface GameDto {
  type: GameType;
  mode: GameMode;
  Players: number[];
  scoreP1: number;
  scoreP2: number;
}

export function Game() {
  const data: GameDto = {
    type: GameType.PRACTICE,
    mode: GameMode.V1,
    Players: [1, 1],
    scoreP1: 11,
    scoreP2: 7,
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
