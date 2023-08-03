import React, { useContext } from "react";
import "./Home.css";
import { HomeLogged } from "./HomeLogged";
import { PracticePong } from "../../game/components/PracticePong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { AuthContext } from "../../components/Auth/auth.context";

export default function Home() {
  const { authed } = useContext(AuthContext);

  return (
    <div className="full">
      {!authed  ? <HomeUnlogged /> : <HomeLogged />}
    </div>
  );
}

export function HomeUnlogged() {
  const paddleColor: RgbColor = stringToRGB("ffffff");

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
