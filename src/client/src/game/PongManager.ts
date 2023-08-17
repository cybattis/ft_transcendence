import AIOnlyPongState from "./states/AIOnlyPongState";
import PracticePongState from "./states/PracticePongState";
import MultiplayerPongState from "./states/MultiplayerPongState";

let lastFrameTimestamp: DOMHighResTimeStamp = 0;
let AIOnlyGameList: AIOnlyPongState[] = new Array<AIOnlyPongState>();
let practiceGameList: PracticePongState[] = new Array<PracticePongState>();
let multiplayerGame: MultiplayerPongState | null = null;

let upArrowPressed: boolean = false;
let downArrowPressed: boolean = false;

let gameNotFoundCallback: () => void = () => {};

export function PongManagerOnGameNotFound(callback: () => void) {
  gameNotFoundCallback = callback;
}

export function PongManagerOffGameNotFound() {
  gameNotFoundCallback = () => {};
}

export function startPongManager() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp")
      upArrowPressed = true;
    else if (e.key === "ArrowDown")
      downArrowPressed = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp")
      upArrowPressed = false;
    else if (e.key === "ArrowDown")
      downArrowPressed = false;
  });

  window.addEventListener("keypress", (e) => {
    if (e.key === " ") {
      practiceGameList.forEach((game) => {
        game.start();
      });
      if (multiplayerGame)
        multiplayerGame.readyUp(gameNotFoundCallback);
    }
  });

  lastFrameTimestamp = performance.now();
  window.requestAnimationFrame(updatePongGames);
}

export function updatePongGames(timestamp: DOMHighResTimeStamp) {
  AIOnlyGameList.forEach((game) => {
    game.update((timestamp - lastFrameTimestamp) / 1000.0);
    game.render();
  });

  practiceGameList.forEach((game) => {
    game.update((timestamp - lastFrameTimestamp) / 1000.0, upArrowPressed, downArrowPressed);
    game.render();
  });

  if (multiplayerGame) {
    multiplayerGame.update((timestamp - lastFrameTimestamp) / 1000.0, upArrowPressed, downArrowPressed);
    multiplayerGame.render();
  }

  lastFrameTimestamp = timestamp;
  window.requestAnimationFrame(updatePongGames);
}

export function createNewAIOnlyGame(newGame: AIOnlyPongState) {
  AIOnlyGameList.push(newGame);
}

export function removeAiOnlyGame(name: string) {
  let index = -1;

  for (let i = 0; i < AIOnlyGameList.length; i++) {
    if (AIOnlyGameList[i].state.getName() === name) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    AIOnlyGameList.splice(index, 1);
  }
}

export function createNewPracticeGame(newGame: PracticePongState) {
  practiceGameList.push(newGame);
}

export function removePracticeGame(name: string) {
  let index = -1;

  for (let i = 0; i < practiceGameList.length; i++) {
    if (practiceGameList[i].state.getName() === name) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    practiceGameList.splice(index, 1);
  }
}

export function createNewMultiplayerGame(newGame: MultiplayerPongState) {
  multiplayerGame = newGame;
}

export function removeMultiplayerGame() {
  if (multiplayerGame) {
    multiplayerGame.removeCallbacks();
    multiplayerGame = null;
  }
}