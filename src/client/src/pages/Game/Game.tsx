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
import "./Game.css";
import { MultiplayerClient } from "../../game/networking/multiplayer-client";
import { EndGamePopup, GameNotFoundModal, InfoModal } from "../../components/Modal/PopUpModal";
import { GameStatus } from "../../type/game.type";
import { PongManagerOffGameNotFound, PongManagerOnGameNotFound } from "../../game/PongManager";
import { useNavigate } from "react-router-dom";

export interface PlayerInterface {
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
  const [endGame, setEndGame] = useState(false);
  const [hasWin, setHasWin] = useState(false);
  const [ infoMessage, setInfoMessage ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBothPlayerInfos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        terminateSession();
        return;
      }

      try {
        let payload: TokenData = jwt_decode(token);
        if (!TypeCheckers.isTokenData(payload)) {
          terminateSession();
          return;
        }

        const gameInfos = await get<GameInfos>("game/info/" + payload.id);
        const profileInfos = await get<UserInfo>("user/my-profile");

        const props: GameProps = {
          playerOne: gameInfos.playerOne,
          playerTwo: gameInfos.playerTwo,
          canal: gameInfos.id + gameInfos.mode + gameInfos.type,
          myUsername: profileInfos.nickname
        }

        if (gameInfos.status === GameStatus.FINISHED
          || gameInfos.status === GameStatus.PLAYER1_DISCONNECTED
          || gameInfos.status === GameStatus.PLAYER2_DISCONNECTED) {
          if (gameInfos.playerOne.me) setHasWin(gameInfos.playerOne.hasWin);
          else setHasWin(gameInfos.playerTwo.hasWin);
        }

        setGameProps(props);
      } catch (error) {
        redirectWithError(error);
      }
    };

    function gameEndedCallback() {
      fetchBothPlayerInfos().then(() => {
        setEndGame(true);
      });
    }

    function onGameNotFound() {
      setInfoMessage("Game ended");
    }

    fetchBothPlayerInfos();
    MultiplayerClient.onGameEnded(gameEndedCallback);
    PongManagerOnGameNotFound(onGameNotFound);

    return () => {
      MultiplayerClient.offGameEnded(gameEndedCallback);
      PongManagerOffGameNotFound();
    };
  }, []);

  function onGameNotFoundAcknowledged() {
    navigate("/");
  }

  return (
    <>
      {infoMessage === "" ?
        (gameProps === null ? <LoadingPage /> :
          <GameLoaded
            playerOne={gameProps.playerOne}
            playerTwo={gameProps.playerTwo}
            canal={gameProps.canal}
            myUsername={gameProps.myUsername}
            endGame={endGame}
            hasWin={hasWin}
          />
        )
         :
        <GameNotFoundModal text={infoMessage} onClose={onGameNotFoundAcknowledged} />
      }
    </>
  );
}

function GameLoaded(props: GameProps & {endGame: boolean, hasWin: boolean}) {
  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());

  return (
    <div className="game-page">
      {props.endGame ? (
        <EndGamePopup hasWin={props.hasWin}/>
      ) : null}
      <div className="game-box">
        <MultiplayerPong
          width={1600}
          height={800}
          paddleColor={rgb}
        />
      </div>
      <div className="game-extra">
        <div className="game-chat-box">
          <PlayerList playerOne={props.playerOne} playerTwo={props.playerTwo} />
          <PrivateGameChat
              playerOne={props.playerOne.username}
              playerTwo={props.playerTwo.username}
              canal={props.canal}
              myUsername={props.myUsername}
          />
        </div>
      </div>
    </div>
  );
}
