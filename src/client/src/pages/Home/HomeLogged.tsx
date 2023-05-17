import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import { Chat } from "../../components/Chat/Chat";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserInfo } from "../../type/user.type";
import { Link } from "react-router-dom";

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
      <Link to="game" className="gamemode" />
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

interface Decoded {
  id: string;
}

function UserProfile() {
  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    console.log(e);
  }

  const [data, setData] = useState<UserInfo>({
    nickname: "",
    xp: 0,
    games: [],
  });

  useEffect(() => {
    console.log(decoded);
    async function fetchData(id: string) {
      await axios
        .get(`http://localhost:5400/user/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setData(response.data);
          console.log(response.data);
        });
    }

    if (decoded !== null) fetchData(decoded.id).then((r) => console.log(r));
  }, []);

  return (
    <div className="user">
      <div className="infobox">
        <Avatar size="20%" img={data.avatar} />
        <div className="info">
          <h5>{data.nickname}</h5>
          <p>LVL {data.xp / 1000}</p>
          <p>{data.xp} xp</p>
          <div id="progressbar">
            <div></div>
          </div>
        </div>
      </div>
      <h5>Last matches</h5>
      {data.games?.map((game) => (
        <div>
          <h6>{game.type}</h6>
          <h6>{game.mode}</h6>
          <h6>{game.scoreP1}</h6>
          <h6>{game.scoreP2}</h6>
        </div>
      ))}
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
