import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import ChatClient from "../Chat/Chat";
import { useEffect, useState } from "react";
import { UserInfo } from "../../type/user.type";
import { Navigate } from "react-router-dom";
import { GameStats, GameStatus, GameType } from "../../type/game.type";
import { XPBar } from "../../components/XPBar/XPBar";
import { MatcheScore } from "../../components/Game/MatcheScore";
import { Friends } from "../../components/Friends/Friends";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { UserData } from "../Profile/user-data";
import { MultiplayerClient } from "../../game/networking/multiplayer-client";
import { calculateWinrate } from "../../utils/calculateWinrate";
import {useProfileData} from "../../hooks/UseProfileData";

enum MatchmakingAcceptButtonState {
  SEARCHING,
  MATCH_FOUND,
  WAITING_FOR_OPPONENT,
  GAME_STARTED,
}

function MatchmakingButton(props: {
  gameType: GameType;
  setSearching: (value: boolean) => void;
}) {
  const [state, setState] = useState(MatchmakingAcceptButtonState.SEARCHING);
  const [timeLeft, setTimeLeft] = useState(0);
  const countdownOffset: number = 10;

  useEffect(() => {
    let countdownTimeout: NodeJS.Timeout | null = null;

    const countdown = (): NodeJS.Timeout => {
      return setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    };

    const matchFoundCallback = (acceptTimeout: number) => {
      setState(MatchmakingAcceptButtonState.MATCH_FOUND);
      setTimeLeft(acceptTimeout + countdownOffset);
      countdownTimeout = countdown();
    };

    const handleGameStarted = () => {
      setState(MatchmakingAcceptButtonState.GAME_STARTED);
    };

    MatchmakingClient.onMatchFound(matchFoundCallback);
    MatchmakingClient.ongameStarted(handleGameStarted);

    if (timeLeft > 0) {
      // If the player doesn't accept the game in time, stop matchmaking
      if (
        timeLeft <= countdownOffset &&
        state === MatchmakingAcceptButtonState.MATCH_FOUND
      ) {
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

      if (countdownTimeout) clearTimeout(countdownTimeout);
    };
  }, [timeLeft, state, props]);

  const handleClick = () => {
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
  };

  let cssClass: string = "matchmaking-button";
  if (state === MatchmakingAcceptButtonState.MATCH_FOUND) cssClass += "-found";
  else if (state === MatchmakingAcceptButtonState.WAITING_FOR_OPPONENT)
    cssClass += "-waiting";

  return (
    <>
      {state === MatchmakingAcceptButtonState.GAME_STARTED ? (
        <Navigate to="game" />
      ) : (
        <button onClick={handleClick} className={cssClass}>
          <div>
            {state === MatchmakingAcceptButtonState.MATCH_FOUND &&
              (timeLeft >= countdownOffset
                ? "Accept " + (timeLeft - countdownOffset).toString() + "..."
                : "Accept...")}
            {state === MatchmakingAcceptButtonState.WAITING_FOR_OPPONENT &&
              "Waiting for opponent..."}
            {state === MatchmakingAcceptButtonState.SEARCHING && "Searching..."}
          </div>
        </button>
      )}
    </>
  );
}

function MultiplayerGameMode(props: {
  gameType: GameType;
  setSearching: (value: boolean) => void;
}) {
  const handleClick = () => {
    if (props.gameType === GameType.CASUAL)
      MatchmakingClient.joinMatchmakingCasual();
    else if (props.gameType === GameType.RANKED)
      MatchmakingClient.joinMatchmakingRanked();

    props.setSearching(true);
  };

  if (props.gameType.toString() === "Casual") {
    return (
      <div className="game-mode-button">
        <button className="casual" onClick={handleClick}>
          <h2 className="titleMode">Casual</h2>
        </button>
      </div>
    );
  }
  return (
    <div className="game-mode-button">
      <button className="ranked" onClick={handleClick}>
        <h2 className="titleMode">Ranked</h2>
      </button>
    </div>
  );
}

function PracticeGameMode() {
  return (
    <div className="game-mode-button">
      <button className="practice">
        <h2 className="titleMode">Practice</h2>
      </button>
    </div>
  );
}

function GameLauncher() {
  const [searchingCasual, setSearchingCasual] = useState(false);
  const [searchingRanked, setSearchingRanked] = useState(false);

  return (
    <div className="game-launcher">
      {!searchingCasual && !searchingRanked && (
        <>
          <h1 className="game-mode-title">Game modes</h1>
          <div className="game-mode">
            <PracticeGameMode />
            <MultiplayerGameMode
              gameType={GameType.CASUAL}
              setSearching={setSearchingCasual}
            />
            <MultiplayerGameMode
              gameType={GameType.RANKED}
              setSearching={setSearchingRanked}
            />
          </div>
        </>
      )}
      {searchingCasual && (
        <MatchmakingButton
          gameType={GameType.CASUAL}
          setSearching={setSearchingCasual}
        />
      )}
      {searchingRanked && (
        <MatchmakingButton
          gameType={GameType.RANKED}
          setSearching={setSearchingRanked}
        />
      )}
    </div>
  );
}

function Result(props: { game: GameStats; userId: number }) {
  const isWin =
    (props.game.ids[0] === props.userId &&
      props.game.scoreP1 > props.game.scoreP2) ||
    (props.game.ids[1] === props.userId &&
      props.game.scoreP1 < props.game.scoreP2);

  return (
    <div className={"home-game-result"}>
      {isWin ? (
        <div>
          <div className={"home-result-win"}>Win</div>
          <MatcheScore game={props.game} userId={props.userId} />
        </div>
      ) : (
        <div>
          <div className={"home-result-loose"}>Loose</div>
          <MatcheScore game={props.game} userId={props.userId} />
        </div>
      )}
    </div>
  );
}

function LastMatch(props: { data: UserInfo }) {
  let slice: number = -3;

  if (props.data.games?.at(-1)?.status === GameStatus.IN_PROGRESS) {
    slice = -4;
  }

  const lastGames = props.data.games?.slice(slice).filter((game) => {
    return game.status === GameStatus.FINISHED;
  });

  return (
    <div className={"lastmatch"}>
      <h5>Last matches</h5>
      <div className={"last-match-stats"}>
        {props.data.games && props.data.games.length > 0 ? (
          lastGames?.map((game, index) => (
            <div key={index}>
              <Result game={game} userId={props.data.id} />
            </div>
          ))
        ) : (
          <div className={"no-game"}>
            <hr className={"user-profile-hr"} />
            <div>No match</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Winrate(props: { data: UserInfo }) {
  const winrate = calculateWinrate(props.data);

  return (
    <div className={"home-stat-box"}>
      <h5>Winrate</h5>
      <hr className={"user-profile-hr"} />
      <div>{winrate.toFixed(0)}%</div>
    </div>
  );
}

function HomeStatContainerDesktop(props: { data: UserInfo }) {
  return (
    <div className="home-stats-container-desktop">
      <LastMatch data={props.data} />
      <div className={"home-stat-box"}>
        <h5>Matches</h5>
        <hr className={"user-profile-hr"} />
        <div>{props.data.games?.filter(
          (game) => game.type === GameType.RANKED &&
            (game.status === GameStatus.FINISHED || game.status === GameStatus.PLAYER_DISCONNECTED)
        ).length}
        </div>
      </div>
      <Winrate data={props.data} />
      <div className={"home-stat-box"}>
        <h5>ELO</h5>
        <hr className={"user-profile-hr"} />
        <div>{props.data.ranking}</div>
      </div>
    </div>
  );
}

function HomeStatContainerMobile(props: { data: UserInfo }) {
  return (
    <div className="home-stats-container-mobile">
      <div id={"hmc-g1"}>
        <LastMatch data={props.data} />
        <div className={"home-stat-box"}>
          <h5>Matches</h5>
          <hr className={"user-profile-hr"} />
          <div>{props.data.games?.filter(
            (game) => game.type === GameType.RANKED &&
              (game.status === GameStatus.FINISHED || game.status === GameStatus.PLAYER_DISCONNECTED)
          ).length}
          </div>
        </div>
      </div>
      <div id={"hmc-g2"}>
        <Winrate data={props.data} />
        <div className={"home-stat-box"}>
          <h5>ELO</h5>
          <hr className={"user-profile-hr"} />
          <div>{props.data.ranking}</div>
        </div>
      </div>
    </div>
  );
}

function UserProfile(props: { data: UserInfo | null }) {
  let xp = 0;
  const data = props.data;

  if (data)
    xp = data.level > 1 ? data.xp - 1000 * (data.level - 1) : data.xp;

  return (
    <div id={"HomeUserInfo"} className="userProfile_container">
      <div className="infobox">
        <Avatar size={200} img={data?.avatarUrl} />
        <div className="info">
          <h5>{data?.nickname}</h5>
          <p>LVL {data?.level}</p>
          <p>{xp} XP</p>
          {data ? <XPBar xp={xp} lvl={data.level} /> : null}
        </div>
      </div>
      {data ?
        <>
          <HomeStatContainerDesktop data={data} />
          <HomeStatContainerMobile data={data} />
        </>
        : null}
    </div>
  );
}

export function HomeLogged() {
  const { data } = useProfileData();

  useEffect(() => {
    MatchmakingClient.connect();
    MultiplayerClient.connect();

    if (data) {
      UserData.updatePaddleColor(data.paddleColor);
      UserData.updateNickname(data.nickname);
    }

    return () => {
      MatchmakingClient.leaveMatchmaking();
    };
  }, [data]);

  return (
    <div className={"home"}>
      <div className={"leftside"}>
        <GameLauncher />
        <UserProfile data={data} />
      </div>
      <div className="rightside">
        <ChatClient />
        <Friends />
      </div>
    </div>
  );
}
