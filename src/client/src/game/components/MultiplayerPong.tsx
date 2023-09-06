import { useEffect, useRef } from "react";
import { createNewMultiplayerGame } from "../PongManager";
import MultiplayerPongState from "../states/MultiplayerPongState";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { PlayerInfos } from "../networking/types";
import { MatchmakingClient } from "../networking/matchmaking-client";

export type MultiplayerPongProps = {
  width: number;
  height: number;
  paddleColor: RgbColor;
  backgroundColor: RgbColor;
};

export function MultiplayerPong({
  width, height, paddleColor, backgroundColor,
}: MultiplayerPongProps) {
  let canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const opponentInfos: PlayerInfos = MatchmakingClient.getOpponentInfos();
    createNewMultiplayerGame(new MultiplayerPongState(canvas,
      paddleColor, stringToRGB(opponentInfos.paddleColor), backgroundColor));
  }, [width, height, paddleColor]);

  return (
    <canvas className={"game-canvas"} ref={canvasRef} width={width} height={height}>
      A multiplayer pong game
    </canvas>
  );
}
