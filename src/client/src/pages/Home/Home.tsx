import React, { useContext } from "react";
import { HomeLogged } from "./HomeLogged";
import { AuthContext } from "../../components/Auth/dto";
import { PracticePong } from "../../game/components/PracticePong";

export default function Home() {
  const { authed } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  return (
    <div className="full">
      {!authed || !token ? <HomeUnlogged /> : <HomeLogged />}
    </div>
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
        <PracticePong
          name={"Home game"}
          width={954}
          height={537}
          aiDifficulty={"Medium"}
        />
      </div>
    </div>
  );
}
