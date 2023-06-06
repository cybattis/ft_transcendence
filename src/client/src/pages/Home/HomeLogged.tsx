import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import ChatClient from "../Chat/Chat";

function GameMode(props: { name: string }) {
  const content = {
    display: "flex",
    flexDirection: "column" as "column",
    width: "100%",
    boxSizing: "border-box" as "border-box",

    alignItems: "center",
    justifyContent: "center",

    margin: "10px",
  };

  return (
    <div style={content}>
      <h5>{props.name}</h5>
      <button className="gamemode"></button>
    </div>
  );
}

function GameLauncher() {
  return (
    <div className="launcher">
      <h4>Game mode</h4>
      <div className="buttons">
        <GameMode name="Practice" />
        <GameMode name="Casual " />
        <GameMode name="Ranked" />
      </div>
    </div>
  );
}

function UserProfile() {
  return (
    <div className="user">
      <div className="infobox">
        <Avatar size="20%" />
        <div className="info">
          <h5>Nickname</h5>
          <p>LVL 10</p>
          <p>300 xp</p>
          <div id="progressbar">
            <div></div>
          </div>
        </div>
      </div>
      <h5>Last matches</h5>
    </div>
  );
}

export function HomeLogged() {
  const home = {
    display: "flex",
    flexDirection: "row" as "row",
    alignItems: "center",

    height: "var(--vp-size)",

    marginRight: "5%",
    marginLeft: "5%",
    gap: "2%",
  };

  const leftSide = {
    display: "flex",
    flex: "1",
    flexDirection: "column" as "column",
    alignItems: "center",

    height: "95%",
    maxWidth: "50%",
    gap: "20px",
  };

  //TODO: fetch relevant user data

  return (
    <div style={home}>
      <div style={leftSide}>
        <GameLauncher />
        <UserProfile />
      </div>
      <ChatClient />
    </div>
  );
}
