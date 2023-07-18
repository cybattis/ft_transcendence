import {useEffect, useRef} from "react";
import {createNewMultiplayerGame, removeMultiplayerGame} from "../PongManager";
import MultiplayerPongState from "../states/MultiplayerPongState";

export type MultiplayerPongProps = {
  name: string;
  width: number;
  height: number;
}

export function MultiplayerPong({name, width, height}: MultiplayerPongProps) {

  let canvasRef = useRef<HTMLCanvasElement>(null);

  console.log("Hello from pong canvas");
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;
    createNewMultiplayerGame(new MultiplayerPongState(name, canvas));

    return () => removeMultiplayerGame(name);
  }, [name, width, height]);

  return (
    <canvas ref={canvasRef} width={width} height={height}>A multiplayer pong game</canvas>
  );
}