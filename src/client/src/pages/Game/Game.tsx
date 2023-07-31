import React, { useState, useEffect } from "react";
import { MultiplayerPong } from "../../game/components/MultiplayerPong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { UserData } from "../Profile/user-data";
import PrivateGameChat from "../Chat/PrivateGameChat";
import axios from "axios";
import { apiBaseURL } from "../../utils/constant";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import "./Game.css"

export function Game() {
  const [playerOne, setPlayerOne] = useState('');
  const [playerTwo, setPlayerTwo] = useState('');
  const [canal, setCanal] = useState('');

  const rgb: RgbColor = stringToRGB(UserData.getPaddleColor());
  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  useEffect(() => {
    const fetchgameInfo = async () => {
      await axios.get(apiBaseURL + "game/info/" + payload.id)
      .then((res) => {
        console.log("RES: ", res);
        setPlayerOne(res.data.playerOne);
        setPlayerTwo(res.data.playerTwo);
        setCanal(res.data.id + res.data.mode + res.data.type);
      })
      .catch((error) => {
        console.log(error);
      });
    }
    
    fetchgameInfo();
  }, [playerOne, playerTwo, canal]);


  return (
    <div className="gamePage">
      <MultiplayerPong
        name={"BESTBESTBEST"}
        width={800}
        height={400}
        paddleColor={rgb}
        />
      <div className="chatBox">
        <div>INFOS JOUEURS</div>
        <PrivateGameChat playerOne={playerOne} playerTwo={playerTwo} canal={canal} />
      </div>
    </div>
  );
}
