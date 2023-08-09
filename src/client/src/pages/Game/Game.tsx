import React, { useState, useEffect } from "react";
import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { UserData } from "../Profile/user-data";
import PrivateGameChat from "../Chat/PrivateGameChat";
import PlayerList from "./PlayerList";
import jwt_decode from "jwt-decode";
import "./Game.css"
import { TokenData } from "../../type/client.type";
import { useFetcher } from "../../hooks/UseFetcher";
import { GameInfos } from "../../type/game.type";
import { LoadingPage } from "../Loading/LoadingPage";
import { TypeCheckers } from "../../utils/type-checkers";
import { useTokenSession } from "../../hooks/UseTokenSession";
import { UserInfo } from "../../type/user.type";

export interface PlayerInterface{
  username: string;
  avatar?: string;
  elo: number;
}

export interface GameProps {
  playerOne: PlayerInterface,
  playerTwo: PlayerInterface,
  canal: string,
  myUsername: string
}

export function Game() {
  const [gameProps, setGameProps] = useState<GameProps | null>(null);
  const { get, redirectWithError } = useFetcher();
  const terminateSession = useTokenSession();

  useEffect(() => {
    const fetchBothPlayerInfos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        terminateSession();
        return;
      }

      const payload: TokenData = jwt_decode(token);
      if (!TypeCheckers.isTokenData(payload)) {
        terminateSession();
        return;
      }

      try {
        const gameInfos = await get<GameInfos>("game/info/" + payload.id);
        const profileInfos = await get<UserInfo>("user/my-profile");

        const props: GameProps = {
          playerOne: gameInfos.playerOne,
          playerTwo: gameInfos.playerTwo,
          canal: gameInfos.id + gameInfos.mode + gameInfos.type,
          myUsername: profileInfos.nickname
        }

        setGameProps(props);
      } catch (error) {
        redirectWithError(error);
      }
    }

    fetchBothPlayerInfos();
  }, []);

  return (
    gameProps === null ? <LoadingPage /> :
      <GameLoaded playerOne={gameProps.playerOne} playerTwo={gameProps.playerTwo} canal={gameProps.canal} myUsername={gameProps.myUsername}/>
  );
}

function GameLoaded(props: {playerOne: PlayerInterface, playerTwo: PlayerInterface, canal: string, myUsername: string}) {
  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());

  return (
    <div className="gamePage">
      <div className="gameScreen">
        <MultiplayerPong
          width={800}
          height={400}
          paddleColor={rgb}
        />
      </div>
      <div className="players">
        <PlayerList playerOne={props.playerOne} playerTwo={props.playerTwo}/>
      </div>
      <div className="chatBox">
        <PrivateGameChat
          playerOne={props.playerOne.username}
          playerTwo={props.playerTwo.username}
          canal={props.canal}
          myUsername={props.myUsername}
        />
      </div>
    </div>
  );
}
