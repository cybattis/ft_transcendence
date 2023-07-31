import React, {useContext, useEffect} from "react";
import "./Home.css";
import { HomeLogged } from "./HomeLogged";
import { PracticePong } from "../../game/components/PracticePong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { AuthContext } from "../../components/Auth/auth.context";
import axios from "axios";
import {apiBaseURL} from "../../utils/constant";
import {ErrorContext} from "../../components/Modal/modalContext";
import {Navigate} from "react-router-dom";

export default function Home() {
  const { authed, setAuthed } = useContext(AuthContext);

  return (
    <div className="full">
      {!authed  ? <HomeUnlogged /> : <HomeLogged />}
    </div>
  );
}

function HomeUnlogged() {
  const { authed, setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token = localStorage.getItem("token");
  const paddleColor: RgbColor = stringToRGB("ffffff");

  useEffect(() => {
    if (!token)
      return;

    axios
      .get(apiBaseURL + "auth/token-validation", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }).then((res) => {
      setAuthed(true);
    }).catch((error) => {
      setAuthed(false);
      setErrorMessage("Your session has expired, please log in again.");
      localStorage.removeItem("token");
      return <Navigate to="/"/>;
    });
  }, [token, authed]);

  return (
    <div className={"homeUnlogged"}>
      <div className={"homeTitle"}>
        <h3>PongFever</h3>
        <h4>Come play to the new and fun multiplayer pong game !</h4>
      </div>
      <div className={"homeGame"}>
        <PracticePong
          name={"Home game"}
          width={1000}
          height={500}
          aiDifficulty={"Medium"}
          paddleColor={paddleColor}
        />
      </div>
    </div>
  );
}
