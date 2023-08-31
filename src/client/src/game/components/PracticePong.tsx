import {createNewPracticeGame, removePracticeGame} from "../PongManager";
import {AIDifficulty} from "../logic/PongAi";
import PracticePongState from "../states/PracticePongState"
import {useEffect, useRef} from "react";
import { RgbColor } from "../../utils/colors";

export type PracticePongProps = {
  name: string;
  width: number;
  height: number;
  aiDifficulty: AIDifficulty;
  paddleColor: RgbColor;
  backgroundColor: RgbColor;
}

export function PracticePong({name, width, height, aiDifficulty, paddleColor, backgroundColor}: PracticePongProps) {
  let canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    createNewPracticeGame(new PracticePongState(name, canvas, aiDifficulty, paddleColor, backgroundColor));

    return () => removePracticeGame(name);
  }, [name, height, aiDifficulty, width]);

  return (
    <canvas ref={canvasRef} width={width} height={height}>A pong game</canvas>
  );
}
