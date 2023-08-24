import "./HomeLogged.css";
import { Avatar } from "../../components/Avatar";
import ChatClient from "../Chat/Chat";
import { useContext, useEffect, useState } from "react";
import { UserInfo } from "../../type/user.type";
import { useNavigate } from "react-router-dom";
import { GameStats, GameStatus, GameType } from "../../type/game.type";
import { XPBar } from "../../components/XPBar/XPBar";
import { MatcheScore } from "../../components/Game/MatcheScore";
import { Friends } from "../../components/Friends/Friends";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";
import { UserData } from "../Profile/user-data";
import { MultiplayerClient } from "../../game/networking/multiplayer-client";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { useProfileData } from "../../hooks/UseProfileData";
import { PopupContext } from "../../components/Modal/Popup.context";
import { ChatClientSocket } from "../Chat/Chat-client";
import { Navigation } from "../../utils/navigation";
import { MatchmakingPlayerStatus, MatchmakingPlayerStatusDTO } from "../../game/networking/types";
import { MatchmakingState } from "../../utils/matchmaking-states";

function MatchmakingButtonWaiting() {
  return (
    <button className={'matchmaking-button-waiting'}>
      Waiting...
    </button>
  );
}

function MatchmakingButtonFound(props: {
  timeLeft: number;
  acceptGame: () => void;
  cancelSearch: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(props.timeLeft);

  useEffect(() => {
    function countdown(): NodeJS.Timeout {
      return setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    let countdownTimeout: NodeJS.Timeout | null = countdown();

    // If the player doesn't accept the game in time, stop matchmaking
    // Else, continue to countdown
    if (timeLeft > 0)
      countdownTimeout = countdown();
    else
      props.cancelSearch();

    return () => {
      if (countdownTimeout)
        clearTimeout(countdownTimeout);
    }
  }, [timeLeft, props]);

  return (
    <button onClick={props.acceptGame} className={"matchmaking-button-found"}>
      {"Accept " + timeLeft.toString() + "..."}
    </button>
  );
}

function MatchmakingButtonSearching(props: { cancelSearch: () => void; }) {
  return (
    <button onClick={props.cancelSearch} className={"matchmaking-button"}>
      Searching...
    </button>
  );
}

function MultiplayerGameMode(props: {
  text: string;
  startSearching: () => void;
}) {
  return (
    <div className="game-mode-button">
      <button className={props.text.toLowerCase()} onClick={props.startSearching}>
        <h2 className="titleMode">{props.text}</h2>
      </button>
    </div>
  );
}

function PracticeGameMode() {
  const navigate = useNavigate();

  return (
    <div className="game-mode-button">
      <button className="practice" onClick={() => navigate("/iagame")}>
        <h2 className="titleMode">Practice</h2>
      </button>
    </div>
  );
}

function GameLauncher() {
  const [state, setState] = useState<MatchmakingPlayerStatusDTO>({ status: MatchmakingPlayerStatus.NONE });
  const { setErrorMessage } = useContext(PopupContext);
  const navigate = useNavigate();

  function startSearchingCasual() {
    MatchmakingClient.joinMatchmakingCasual()
      .catch((err) => {
        MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.NONE });
        setState({ status: MatchmakingPlayerStatus.NONE });
        setErrorMessage(err.message);
      });
    setState({ status: MatchmakingPlayerStatus.SEARCHING_CASUAL });
    MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.SEARCHING_CASUAL });
  }

  function startSearchingRanked() {
    MatchmakingClient.joinMatchmakingRanked()
      .catch((err) => {
        MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.NONE });
        setState({ status: MatchmakingPlayerStatus.NONE });
        setErrorMessage(err.message);
      });
    setState({ status: MatchmakingPlayerStatus.SEARCHING_RANKED });
    MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.SEARCHING_RANKED });
  }

  function cancelCasualSearch() {
    MatchmakingClient.leaveMatchmakingCasual()
      .catch((err) => setErrorMessage(err.message));
    setState({ status: MatchmakingPlayerStatus.NONE });
    MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.NONE });
  }

  function cancelRankedSearch() {
    MatchmakingClient.leaveMatchmakingRanked()
      .catch((err) => setErrorMessage(err.message));
    setState({ status: MatchmakingPlayerStatus.NONE });
    MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.NONE });
  }

  function acceptCasualGame() {
    MatchmakingClient.joinFoundMatch()
      .catch((err) => {
        MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.NONE });
        setState({ status: MatchmakingPlayerStatus.NONE });
        setErrorMessage(err.message);
      });
    setState({ status: MatchmakingPlayerStatus.WAITING_CASUAL });
    MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.WAITING_CASUAL });
  }

  function acceptRankedGame() {
    MatchmakingClient.joinFoundMatch()
      .catch((err) => {
        MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.NONE });
        setState({ status: MatchmakingPlayerStatus.NONE });
        setErrorMessage(err.message);
      });
    setState({ status: MatchmakingPlayerStatus.WAITING_RANKED });
    MatchmakingState.setMatchmakingState({ status: MatchmakingPlayerStatus.WAITING_RANKED });
  }

  useEffect(() => {
    MatchmakingClient.getMatchmakingStatus()
      .then((res) => {
        setState(res);
        MatchmakingState.setMatchmakingState(res);
      })
      .catch((err) => setErrorMessage(err.message));
    MatchmakingClient.onSync(setState);

    function onGameStarted(fromInvite: boolean) {
      if (!fromInvite)
        navigate("/game");
    }
    MatchmakingClient.onGameStarted(onGameStarted);

    return () => {
      MatchmakingClient.offSync(setState);
      MatchmakingClient.offGameStarted(onGameStarted);
    }
  }, []);

  function getMatchmakingButton() {
    switch (state.status) {
      case MatchmakingPlayerStatus.SEARCHING_CASUAL:
        return <MatchmakingButtonSearching cancelSearch={cancelCasualSearch}/>;
      case MatchmakingPlayerStatus.SEARCHING_RANKED:
        return <MatchmakingButtonSearching cancelSearch={cancelRankedSearch}/>;
      case MatchmakingPlayerStatus.FOUND_CASUAL:
        return <MatchmakingButtonFound timeLeft={state.timeLeft ?? 30} cancelSearch={cancelCasualSearch} acceptGame={acceptCasualGame}/>;
      case MatchmakingPlayerStatus.FOUND_RANKED:
        return <MatchmakingButtonFound timeLeft={state.timeLeft ?? 30} cancelSearch={cancelRankedSearch} acceptGame={acceptRankedGame}/>;
      case MatchmakingPlayerStatus.WAITING_CASUAL:
        return <MatchmakingButtonWaiting/>;
      case MatchmakingPlayerStatus.WAITING_RANKED:
        return <MatchmakingButtonWaiting/>;
      case MatchmakingPlayerStatus.NONE:
        return (
          <>
            <h1 className="game-mode-title">Game modes</h1>
            <div className="game-mode">
              <PracticeGameMode />
              <MultiplayerGameMode text={"Casual"} startSearching={startSearchingCasual}/>
              <MultiplayerGameMode text={"Ranked"} startSearching={startSearchingRanked}/>
            </div>
          </>
        );
    }
  }

  return (
    <div className="game-launcher">
      {getMatchmakingButton()}
    </div>
  );
}

function Result(props: { game: GameStats; userId: number }) {
  const isPlayer1 = props.game.ids[0] === props.userId;
  const isPlayer2 = props.game.ids[1] === props.userId;

  const player1Won = (props.game.scoreP1 > props.game.scoreP2 && props.game.status !== GameStatus.PLAYER1_DISCONNECTED)
    || props.game.status === GameStatus.PLAYER2_DISCONNECTED;

  const player2Won = (props.game.scoreP1 < props.game.scoreP2 && props.game.status !== GameStatus.PLAYER2_DISCONNECTED)
    || props.game.status === GameStatus.PLAYER1_DISCONNECTED;

  const isWin = (isPlayer1 && player1Won) || (isPlayer2 && player2Won);

  return (
    <div className={"home-game-result"}>
      <div>
        <div className={isWin ? "home-result-win" : "home-result-loss"}>
          {isWin ? "Win" : "Loss"}
        </div>
        <MatcheScore game={props.game} userId={props.userId} />
      </div>
    </div>
  );
}

function LastMatch(props: { data: UserInfo }) {
  let slice: number = -3;

  if (props.data.games?.at(-1)?.status === GameStatus.IN_PROGRESS) {
    slice = -4;
  }

  const lastGames = props.data.games?.slice(slice).filter((game) => {
    return (
      game.status === GameStatus.FINISHED ||
      game.status === GameStatus.PLAYER1_DISCONNECTED ||
      game.status === GameStatus.PLAYER2_DISCONNECTED
    );
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
        <div>
          {
            props.data.games?.filter(
              (game) =>
                game.type === GameType.RANKED &&
                (game.status === GameStatus.FINISHED ||
                  game.status === GameStatus.PLAYER1_DISCONNECTED ||
                  game.status === GameStatus.PLAYER2_DISCONNECTED)
            ).length
          }
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
          <div>
            {
              props.data.games?.filter(
                (game) =>
                  game.type === GameType.RANKED &&
                  (game.status === GameStatus.FINISHED ||
                    game.status === GameStatus.PLAYER1_DISCONNECTED ||
                    game.status === GameStatus.PLAYER2_DISCONNECTED)
              ).length
            }
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

  if (data) xp = data.level > 1 ? data.xp - 1000 * (data.level - 1) : data.xp;

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
      {data ? (
        <>
          <HomeStatContainerDesktop data={data} />
          <HomeStatContainerMobile data={data} />
        </>
      ) : null}
    </div>
  );
}

export function HomeLogged() {
  const { data } = useProfileData();

  useEffect(() => {
    MatchmakingClient.connect();
    MultiplayerClient.connect();
    ChatClientSocket.connect();

    if (data) {
      UserData.updatePaddleColor(data.paddleColor);
      UserData.updateNickname(data.nickname);
    }
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
