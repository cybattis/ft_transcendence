import { useEffect, useRef } from "react";
import {
  createNewMultiplayerGame,
  removeMultiplayerGame,
} from "../PongManager";
import MultiplayerPongState from "../states/MultiplayerPongState";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { PlayerInfos } from "../networking/types";
import { MatchmakingClient } from "../networking/matchmaking-client";

export type MultiplayerPongProps = {
  name: string;
  width: number;
  height: number;
  paddleColor: RgbColor;
};

export function MultiplayerPong({
  name,
  width,
  height,
  paddleColor,
}: MultiplayerPongProps) {
  let canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const opponentInfos: PlayerInfos = MatchmakingClient.getOpponentInfos();
    createNewMultiplayerGame(
      new MultiplayerPongState(
        name,
        canvas,
        paddleColor,
        stringToRGB(opponentInfos.paddleColor)
      )
    );
  }, [name, width, height, paddleColor]);

  return (
    <canvas ref={canvasRef} width={width} height={height}>
      A multiplayer pong game
    </canvas>
  );
}
