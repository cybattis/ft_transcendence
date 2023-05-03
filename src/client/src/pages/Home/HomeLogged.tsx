import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import { Form } from "react-router-dom";
import { FormEvent, KeyboardEvent, useCallback } from "react";

function GameMode(props: { name: string }) {
  const content = {
    display: "flex",
    flexDirection: "column" as "column",
    flex: "auto",

    alignItems: "center",
    justifyContent: "center",
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

function Chat() {
  const inputStyle = {
    boxSizing: "border-box" as "border-box",
    display: "flex",

    padding: "0 14px",
    gap: "8px",

    height: "40px",
    width: "100%",

    color: "var(--black)",
    background: "white",
    borderRadius: "8px",
    border: "none",
    outline: 0,
  };

  const chatBox = {
    display: "flex",
    flex: "auto",
    boxSizing: "border-box" as "border-box",
  };

  // const keyPress = (event: KeyboardEvent) => {
  //   if (event.key === "Escape" && (loginFormState || signupFormState)) {
  //     setLoginFormState(false);
  //     setSignupFormState(false);
  //     console.log("closing forms");
  //   }
  // };
  //
  // useEffect(() => {
  //   document.addEventListener("keydown", keyPress);
  //   return () => document.removeEventListener("keydown", keyPress);
  // });

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        console.log("enter");
      }
      console.log(event);
    },
    []
  );

  return (
    <div className="chat">
      <div>global</div>
      <div style={chatBox}></div>
      <form>
        <input
          style={inputStyle}
          type="text"
          placeholder="Type here..."
          onKeyDown={onInputKeyDown}
          name="msg"
        />
      </form>
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
    flexDirection: "column" as "column",
    alignItems: "center",
    flex: "1.5 1 100px",
    width: "100%",

    height: "95%",
    gap: "20px",
  };

  //TODO: fetch relevant user data

  return (
    <div style={home}>
      <div style={leftSide}>
        <GameLauncher />
        <UserProfile />
      </div>
      <Chat />
    </div>
  );
}
