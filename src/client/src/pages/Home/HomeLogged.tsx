import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import ChatClient from "../Chat/Chat";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserInfo } from "../../type/user.type";
import { Navigate } from "react-router-dom";
import { GameStatsDto, GameStatus, GameType } from "../../type/game.type";
import { XPBar } from "../../components/XPBar/XPBar";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { MatcheScore } from "../../components/Game/MatcheScore";
import { AuthContext } from "../../components/Auth/dto";
import { Friends } from "../../components/Friends/Friends";
import { JwtPayload } from "../../type/client.type";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import jwt_decode from "jwt-decode";
import { apiBaseURL } from "../../utils/constant";
import { ErrorContext } from "../../components/Modal/modalContext";
import { UserData } from "../Profile/user-data";
import { ChatClientSocket } from "../Chat/Chat-client";

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
      console.log("REDIRECTION TO GAMEU");
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
    let decoded: JwtPayload | null = null;
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
    } catch (e) {}

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
    <div className="game-launcher">
      {!searchingCasual && !searchingRanked && (
        <>
          <h4 className="game-mode-title">Game mode</h4>
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

function Result(props: { game: GameStatsDto; userId: number }) {
  const isWin =
    (props.game.players[0].id == props.userId &&
      props.game.scoreP1 > props.game.scoreP2) ||
    (props.game.ids[1] == props.userId &&
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
  const winrate: number = calculateWinrate(props.data);

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
        <div>{props.data.games?.length}</div>
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
          <div>{props.data.games?.length}</div>
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

function UserProfile(props: { data: UserInfo }) {
  const data = props.data;
  const xp = data.level > 1 ? data.xp - 1000 * (data.level - 1) : data.xp;

  return (
    <div id={"HomeUserInfo"} className="userProfile_container">
      <div className="infobox">
        <Avatar size={200} img={data.avatarUrl} />
        <div className="info">
          <h5>{data.nickname}</h5>
          <p>LVL {data.level}</p>
          <p>{xp} XP</p>
          <XPBar xp={data.xp} lvl={data.level} />
        </div>
      </div>
      <HomeStatContainerDesktop data={data} />
      <HomeStatContainerMobile data={data} />
    </div>
  );
}

export function HomeLogged() {
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  const token = localStorage.getItem("token");
  const [data, setData] = useState<UserInfo>({
    id: 0,
    nickname: "",
    avatarUrl: "",
    level: 0,
    xp: 0,
    ranking: 0,
    games: [],
    friendsId: [],
    requestedId: [],
    blockedId: [],
    blockedById: [],
    paddleColor: "ffffff",
  });

  useEffect(() => {
    async function fetchData() {
      const payload: JwtPayload = jwt_decode(token as string);

      console.log(payload);
      await axios
        .get(apiBaseURL + "user/profile/" + payload.nickname, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          UserData.updatePaddleColor(res.data.paddleColor);
          UserData.updateNickname(res.data.nickname);
          setData(res.data);
        })
        .catch((error) => {
          if (error.response === undefined) {
            localStorage.clear();
            setErrorMessage("Error unknown...");
          } else if (
            error.response.status === 403 ||
            error.response.status === 400
          ) {
            localStorage.clear();
            setAuthToken(null);
            setErrorMessage("Session expired, please login again!");
          } else {
            setErrorMessage(error.response.data.message + "!");
          }
          return <Navigate to={"/"} />;
        });
    }

    fetchData().then(() => {});

    ChatClientSocket.onNotificationEvent(fetchData);

    return () => {
      MatchmakingClient.leaveMatchmaking();
    };
  }, []);

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

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
