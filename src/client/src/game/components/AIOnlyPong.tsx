import {useEffect, useRef} from "react";
import {createNewAIOnlyGame, removeAiOnlyGame} from "../PongManager";
import {AIDifficulty} from "../logic/PongAi";
import AIOnlyPongState from "../states/AIOnlyPongState"

export type AIOnlyPongProps = {
  name: string;
  width: number;
  height: number;
  leftDifficulty: AIDifficulty;
  rightDifficulty: AIDifficulty;
}

export function AIOnlyPong({name, width, height, leftDifficulty, rightDifficulty}: AIOnlyPongProps) {

  let canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    createNewAIOnlyGame(new AIOnlyPongState(name, canvas, leftDifficulty, rightDifficulty));

    return () => removeAiOnlyGame(name);
  }, [name, height, leftDifficulty, rightDifficulty, width]);

  return (
    <canvas ref={canvasRef} width={width} height={height}>A pong game</canvas>
  );
}