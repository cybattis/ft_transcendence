//import { useOutletContext } from "react-router-dom";
import React from "react";
import { HomeLogged } from "./HomeLogged";
import { AIOnlyPong } from "../../game/components/AIOnlyPong";
import { AuthContext } from "../../components/Auth/dto";
import { useContext } from "react";
import axios from 'axios';

async function CheckToken(token: string | null) {
  if (token === null)
    return ;
  const { data } =  await axios.get('http://localhost:5400/auth/validation/' + token);
  if (data.status === parseInt('401')) {
    localStorage.removeItem('token');
  }
}

export default function Home() {
  const { authed } = useContext(AuthContext);
  //const contextData = useOutletContext();
  CheckToken(localStorage.getItem('token'));

  return (
    <div className="full">{!authed ? <HomeUnlogged /> : <HomeLogged />}</div>
  );
}

function HomeUnlogged() {
  const home = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    height: "var(--vp-size)",
  };

  const title = {
    width: "715px",
    height: "112px",
    alignItems: "center",
    textAlign: "center" as "center",
  };

  const game = {
    display: "block",

    maxWidth: "954px",
    maxHeight: "537px",

    width: "50vw",
    height: "56.25vh",

    boxShadow: "inset 0 0 16px 22px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",

    marginBottom: "2em",
  };

  return (
    <div style={home}>
      <h3>PongFever</h3>
      <h4 style={title}>
        Come play to the new and fun multiplayer pong game !
      </h4>
      <div style={game}>
        <AIOnlyPong
          name={"Home game"}
          width={954}
          height={537}
          leftDifficulty={"Medium"}
          rightDifficulty={"Hard"}
        />
      </div>
    </div>
  );
}
