import React, { useState, useEffect } from "react";
import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { UserData } from "../Profile/user-data";
import PrivateGameChat from "../Chat/PrivateGameChat";
import PlayerList from "./PlayerList";
import axios from "axios";
import { apiBaseURL } from "../../utils/constant";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import "./Game.css"

export interface PlayerInterface{
  username: string;
  avatar: string;
  elo: string;
}

export function Game() {
  const [myUsername, setMyUsername] = useState('');
  const [canal, setCanal] = useState('');
  const [playerOne, setPlayerOne] = useState<PlayerInterface>();
  const [playerTwo, setPlayerTwo] = useState<PlayerInterface>();


  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());
  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  useEffect(() => {
    const fetchBothPlayerInfos = async () => {
      await axios.get(apiBaseURL + "game/info/" + payload.id)
      .then((res) => {
        setPlayerOne(res.data.playerOne);
        setPlayerTwo(res.data.playerTwo);
        setCanal(res.data.id + res.data.mode + res.data.type);
      })
      .catch((error) => {
        console.log(error);
      });

      await axios.get(apiBaseURL + "user/myProfile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMyUsername(res.data.nickname);
      })
      .catch((error) => {
        console.log(error);
      });
    }

  fetchBothPlayerInfos();
  }, []);

  let p1: any, p2: any;
  if (playerOne)
    p1 = playerOne.username;
  if (playerTwo)
    p2 = playerTwo.username;

  return (
    <div className="gamePage">
      <div className="gameScreen">
        <MultiplayerPong
          name={"BESTBESTBEST"}
          width={800}
          height={400}
          paddleColor={rgb}
          />
      </div>
      <div className="players">
        <PlayerList playerOne={playerOne} playerTwo={playerTwo}/>
      </div>
      <div className="chatBox">
        <PrivateGameChat playerOne={p1} playerTwo={p2} canal={canal} myUsername={myUsername}/>
      </div>
    </div>
  );
}
