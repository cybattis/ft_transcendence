import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import { Chat } from "../../components/Chat/Chat";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserInfo } from "../../type/user.type";
import { GameBodyDto, GameType } from "../../type/game.type";
import { Decoded } from "../../type/client.type";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { Navigate } from "react-router-dom";

enum MatchmakingAcceptButtonState {
  SEARCHING,
  MATCH_FOUND,
  WAITING_FOR_OPPONENT,
  GAME_STARTED
}

function MatchmakingButton(props: { gameType: GameType, setSearching: (value: boolean) => void }) {
  const [state, setState] = useState(MatchmakingAcceptButtonState.SEARCHING);
  const [timeLeft, setTimeLeft] = useState(0);
  const countdownOffset: number = 10;

  useEffect(() => {
    let countdownTimeout: NodeJS.Timeout | null = null;

    const countdown = (): NodeJS.Timeout => {
      return setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    const matchFoundCallback = (acceptTimeout: number) => {
      setState(MatchmakingAcceptButtonState.MATCH_FOUND);
      setTimeLeft(acceptTimeout + countdownOffset);
      countdownTimeout = countdown();
    };

    const handleGameStarted = () => {
      console.log("REDIRECTION TO GAMEU");
      setState(MatchmakingAcceptButtonState.GAME_STARTED);
    };

    MatchmakingClient.onMatchFound(matchFoundCallback);
    MatchmakingClient.ongameStarted(handleGameStarted);

    if (timeLeft > 0) {
      // If the player doesn't accept the game in time, stop matchmaking
      if (timeLeft <= countdownOffset && state === MatchmakingAcceptButtonState.MATCH_FOUND) {
        props.setSearching(false);
      } else {
        // Else, continue the countdown to wait for the server to start the game
        countdownTimeout = countdown();
      }
    } else {
      if (state === MatchmakingAcceptButtonState.WAITING_FOR_OPPONENT) {
        // The opponent didn't accept the game, continue matchmaking
        switch (props.gameType) {
          case GameType.CASUAL:
            MatchmakingClient.joinMatchmakingCasual();
            break;
          case GameType.RANKED:
            MatchmakingClient.joinMatchmakingRanked();
            break;
        }
        setState(MatchmakingAcceptButtonState.SEARCHING);
      }
    }

    return () => {
      MatchmakingClient.offMatchFound(matchFoundCallback);
      MatchmakingClient.offgameStarted(handleGameStarted);

      if (countdownTimeout)
        clearTimeout(countdownTimeout);
    }
  });

  const handleClick = () => {
    let decoded: Decoded | null = null;
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
    } catch (e) {
    }

    if (decoded) {
      if (state === MatchmakingAcceptButtonState.SEARCHING) {
        switch (props.gameType) {
          case GameType.CASUAL:
            MatchmakingClient.leaveMatchmakingCasual();
            break;
          case GameType.RANKED:
            MatchmakingClient.leaveMatchmakingRanked();
            break;
        }

        props.setSearching(false);
      } else if (state === MatchmakingAcceptButtonState.MATCH_FOUND) {
        MatchmakingClient.joinFoundMatch();
        setState(MatchmakingAcceptButtonState.WAITING_FOR_OPPONENT);
      }
    }
  }

  let cssClass: string = "matchmaking-button";
  if (state === MatchmakingAcceptButtonState.MATCH_FOUND)
    cssClass += "-found";
  else if (state === MatchmakingAcceptButtonState.WAITING_FOR_OPPONENT)
    cssClass += "-waiting";

  return (
      <>
      {state === MatchmakingAcceptButtonState.GAME_STARTED ? <Navigate to="game"/> :
    <button onClick={handleClick} className={cssClass}>
      <div>{state === MatchmakingAcceptButtonState.MATCH_FOUND && (timeLeft >= countdownOffset ? "Accept " + (timeLeft - countdownOffset).toString() + "..." : "Accept...")}
        {state === MatchmakingAcceptButtonState.WAITING_FOR_OPPONENT && ("Waiting for opponent...")}
        {state === MatchmakingAcceptButtonState.SEARCHING && ("Searching...")}
        </div>
    </button>}
          </>
  );
}

function MultiplayerGameMode(props: { gameType: GameType, setSearching: (value: boolean) => void }) {

  const handleClick = () => {
    if (props.gameType === GameType.CASUAL)
      MatchmakingClient.joinMatchmakingCasual();
    else if (props.gameType === GameType.RANKED)
      MatchmakingClient.joinMatchmakingRanked();

    props.setSearching(true);
  }

  return (
    <button onClick={handleClick} className="game-mode-button">
      <div>{props.gameType.toString()}</div>
    </button>
  );
}

function PracticeGameMode() {
  return (
    <button className="game-mode-button">
      <div>Practice</div>
    </button>
  );
}

function GameLauncher() {
  const [searchingCasual, setSearchingCasual] = useState(false);
  const [searchingRanked, setSearchingRanked] = useState(false);

  return (
    <div className="launcher">
      {(!searchingCasual && !searchingRanked) && (
        <>
          <h4 className="game-mode-title">Game mode</h4>
          <div className="buttons">
            <PracticeGameMode />
            <MultiplayerGameMode gameType={GameType.CASUAL} setSearching={setSearchingCasual}/>
            <MultiplayerGameMode gameType={GameType.RANKED} setSearching={setSearchingRanked}/>
          </div>
        </>
      )}
      {searchingCasual && (
        <MatchmakingButton gameType={GameType.CASUAL} setSearching={setSearchingCasual}/>
      )}
      {searchingRanked && (
        <MatchmakingButton gameType={GameType.RANKED} setSearching={setSearchingRanked}/>
      )}
    </div>
  );
}

function Result(props: { game: GameBodyDto; data: UserInfo }) {
  return (
    <div className={"gameResult"}>
      <div>
        {(props.game.ids[0] === props.data.id &&
          props.game.scoreP1 > props.game.scoreP2) ||
        (props.game.ids[1] === props.data.id &&
          props.game.scoreP1 < props.game.scoreP2) ? (
          <div className={"win"}>Win</div>
        ) : (
          <div className={"loose"}>Loose</div>
        )}
      </div>
      <div>
        {props.game.scoreP1}-{props.game.scoreP2}
      </div>
    </div>
  );
}

function LastMatch(props: { data: UserInfo }) {
  return (
    <div className={"statsBox"}>
      <h5>Last matches</h5>
      <div className={"lastmatch"}>
        {props.data.games?.slice(-5).map((game, index) => (
          <div key={index}>
            <Result game={game} data={props.data} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Winrate(props: { data: UserInfo }) {
  const winrate: number =
    props.data.totalGameWon && props.data.games?.length
      ? (props.data.totalGameWon * 100) / props.data.games?.length
      : 0;

  return (
    <div className={"statsBox"}>
      <h5>Winrate</h5>
      <br />
      <div>{winrate.toFixed(0)}%</div>
    </div>
  );
}

function UserProfile() {
  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    //console.log(e);
  }

  const [data, setData] = useState<UserInfo>({
    id: 0,
    nickname: "",
    level: 0,
    xp: 0,
    ranking: 0,
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
          <p>LVL {data.level}</p>
          <p>{data.xp} xp</p>
          <progress id="progressbar" max={1000} value={data.xp}></progress>
        </div>
      </div>
      <div className="stats">
        <LastMatch data={data} />
        <Winrate data={data} />
        <div className={"statsBox"}>
          <h5>ELO</h5>
          <br />
          <div>{data.ranking}</div>
        </div>
      </div>
    </div>
  );
}

export function HomeLogged() {

  useEffect(() => {
    return () => {
      MatchmakingClient.leaveMatchmaking();
    }
  });

  return (
    <div className={"home"}>
      <div className={"leftside"}>
        <GameLauncher />
        <UserProfile />
      </div>
      <Chat />
    </div>
  );
}
