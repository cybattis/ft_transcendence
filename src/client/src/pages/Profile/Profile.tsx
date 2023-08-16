import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { useParams } from "react-router-dom";
import { UserFriendsData, UserInfo } from "../../type/user.type";
import { Avatar } from "../../components/Avatar";
import {
  GameStatsHeader,
  GameStatsItem,
} from "../../components/Game/GameStatsItem";
import { calculateWinrate } from "../../utils/calculateWinrate";
import { GameStats, GameStatus, GameType } from "../../type/game.type";
import jwt_decode from "jwt-decode";
import { PopupContext } from "../../components/Modal/Popup.context";
import { ProfileType, TokenData } from "../../type/client.type";
import { RgbColor, hslToRgb, RGBToHSL, HslColor } from "../../utils/colors";
import { UserData } from "./user-data";
import { ChatClientSocket } from "../Chat/Chat-client";
import { useData } from "../../hooks/UseData";
import { LoadingPage } from "../Loading/LoadingPage";
import { useFetcher } from "../../hooks/UseFetcher";
import { Fetching } from "../../utils/fetching";
import { TypeCheckers } from "../../utils/type-checkers";
import { MatchmakingClient } from "../../game/networking/matchmaking-client";

enum relationStatus {
  NONE,
  ME,
  FRIEND,
  REQUESTED,
  BLOCKED,
  BLOCKEDBY,
}

interface FriendRequestProps {
  data: UserInfo;
  status: relationStatus;
  setStatus: (status: relationStatus) => void;
}

interface InviteToGameProps {
  data: UserInfo;
  status: boolean,
  setStatus: (status: boolean) => void;
}

function BlockUser(props: FriendRequestProps) {
  const { put, showErrorInModal } = useFetcher();

  const handleUnblockButton = async () => {
    put<UserFriendsData>(`user/unblock/${props.data.id}`, {})
      .then(res => {
        ChatClientSocket.notificationEvent(props.data.id);
        props.setStatus(relationStatus.NONE);
      })
      .catch(showErrorInModal);
  };

  const handleBlockButton = async () => {
    put<UserFriendsData>(`user/block-user/${props.data.id}`, {})
      .then(res => {
        ChatClientSocket.notificationEvent(props.data.id);
        props.setStatus(relationStatus.BLOCKED);
      })
      .catch(showErrorInModal);
  };

  if (props.status !== relationStatus.BLOCKED) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleBlockButton}
        >
          BLOCK
        </button>
      </>
    );
  } else {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleUnblockButton}
        >
          UNBLOCK
        </button>
      </>
    );
  }
}

function FriendRequest(props: FriendRequestProps) {
  const { put, showErrorInModal } = useFetcher();

  const handleAddFriend = async () => {
    put(`user/friend-request/${props.data.id}`, {})
      .then(() => props.setStatus(relationStatus.REQUESTED))
      .catch(showErrorInModal);
  };

  const handleRemoveButton = async () => {
    put(`user/remove-friend/${props.data.id}`, {})
      .then(() => props.setStatus(relationStatus.NONE))
      .catch(showErrorInModal);
  };

  if (props.status === relationStatus.NONE) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleAddFriend}
        >
          ADD FRIEND
        </button>
      </>
    );
  } else if (props.status === relationStatus.FRIEND) {
    return (
      <>
        <button
          className="friendButton"
          type="button"
          onClick={handleRemoveButton}
        >
          REMOVE FRIEND
        </button>
      </>
    );
  } else if (props.status === relationStatus.BLOCKEDBY) {
    return (
      <>
        <button className="friendButton" type="button">
          YOU ARE BLOCKED
        </button>
      </>
    );
  } else {
    return (
      <>
        <button className="friendButton">PENDING...</button>
      </>
    );
  }
}

function InviteToGame(props: InviteToGameProps) {
  function inviteToCasualGame() {
    MatchmakingClient.inviteUserToCasualGame(props.data.id);
    props.setStatus(true);
  }

  function inviteToRankedGame() {
    MatchmakingClient.inviteUserToRankedGame(props.data.id);
    props.setStatus(true);
  }

  if (props.status === false) {
    return (
      <>
        <button className="friendButton" type="button" onClick={inviteToCasualGame}>
          Invite to casual game
        </button>
        <button className="friendButton" type="button" onClick={inviteToRankedGame}>
          Invite to ranked game
        </button>
      </>
    );
  } else {
    return (
        <button className="friendButton">Waiting for player to join the game...</button>
    );
  }
}

function PaddleColor(props: {
  oldColor: RgbColor;
  setOldColor: (value: RgbColor) => void;
}) {
  const { setErrorMessage, setInfoMessage } = useContext(PopupContext);
  const [hue, setHue] = useState<HslColor>({
    h: RGBToHSL(props.oldColor).h,
    s: 100,
    l: RGBToHSL(props.oldColor).l,
  });
  const { get, put, showErrorInModal } = useFetcher();
  const color: RgbColor = hslToRgb(hue);

  const style = {
    width: "20px",
    height: "100px",
    backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
  };

  function updatePaddleColor(): void {
    function componentToHex(c: number) {
      const hex: string = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }

    const colorString: string =
      componentToHex(color.r) +
      componentToHex(color.g) +
      componentToHex(color.b);

    put("user/customization/paddleColor",
      { color: colorString },
      "application/json")
      .then(() => {
        UserData.updatePaddleColor(colorString);
        props.setOldColor(hslToRgb(hue));
        setInfoMessage("Color updated successfully!");
      })
      .catch((err) => {
        if (!Fetching.isFetchingError(err))
          return;
        if (err.isRequestError() && err.code === 400) {
          setErrorMessage(err.message);

          const token = localStorage.getItem("token");
          if (!token)
            return;
          const decoded: TokenData = jwt_decode(token);
          if (!TypeCheckers.isTokenData(decoded))
            return;

          get<string>("user/customization/paddleColor/" + decoded.id)
            .then(serverColor => {
              const actualColor: RgbColor = {
                r: parseInt(serverColor.substring(0, 2), 16),
                g: parseInt(serverColor.substring(2, 4), 16),
                b: parseInt(serverColor.substring(4, 6), 16),
              };
              setHue(RGBToHSL(actualColor));
            })
            .catch(showErrorInModal);
        }
        else
          showErrorInModal(err);
      });
  }

  function resetPaddleColor(): void {
    put("user/customization/paddleColor",
        { color: "ffffff" },
        "application/json")
      .then(() => {
        UserData.updatePaddleColor("ffffff");
        setInfoMessage("Color reset successfully!");
        props.setOldColor({ r: 255, g: 255, b: 255 });
        setHue({ h: 0, s: 100, l: 100 });
      })
      .catch((err) => {
        if (!Fetching.isFetchingError(err))
          return;
        if (err.isRequestError() && err.code === 400) {
          setErrorMessage(err.message);

          const token = localStorage.getItem("token");
          if (!token)
            return;
          const decoded: TokenData = jwt_decode(token);
          if (!TypeCheckers.isTokenData(decoded))
            return;

          get<string>("user/customization/paddleColor/" + decoded.id)
            .then(serverColor => {
              const actualColor: RgbColor = {
                r: parseInt(serverColor.substring(0, 2), 16),
                g: parseInt(serverColor.substring(2, 4), 16),
                b: parseInt(serverColor.substring(4, 6), 16),
              };
              setHue(RGBToHSL(actualColor));
            })
            .catch(showErrorInModal);
        }
        else
          showErrorInModal(err);
      });
  }

  return (
    <>
      <div className={"customization-content"}>
        <h5>Customize your paddle</h5>
        <div className={"customization-box"}>
          <div className={"color-slider"}>
            <div className={"color-gradient"}></div>
            <input
              type="range"
              min="0"
              max="360"
              className="slider"
              id="myRange"
              value={hue.h}
              onChange={(e) =>
                setHue({ h: parseInt(e.target.value), s: 100, l: 50 })
              }
            ></input>
            <div className={"customization-button-box"}>
              <button
                className={"update-color-button"}
                onClick={updatePaddleColor}
              >
                Update color
              </button>
              <button
                className={"update-color-button"}
                onClick={resetPaddleColor}
              >
                Reset color
              </button>
            </div>
          </div>
          <div className={"paddle-container"}>
            <div style={style}></div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProfileLoader(props: {profileType: ProfileType}) {
  const params = useParams();
  const url = props.profileType === ProfileType.MyProfile ? "user/my-profile"
      : props.profileType === ProfileType.NicknameProfile ? `user/profile/nickname/${params.username}`
      : `user/profile/id/${params.id}`;
  const { data } = useData<UserInfo>(url, true);

  return data ? <Profile data={data}/> : <LoadingPage/>;
}

export function Profile(props: {data: UserInfo}) {
  const [friendStatus, setFriendStatus] = useState(relationStatus.NONE);
  const [isInvitedToGame, setIsInvitedToGame] = useState(false);
  const [customization, setCustomization] = useState(false);
  const winrate: number = calculateWinrate(props.data);
  const [oldColor, setOldColor] = useState<RgbColor>({
    r: props.data.paddleColor ? parseInt(props.data.paddleColor.substring(0, 2), 16) : 255,
    g: props.data.paddleColor ? parseInt(props.data.paddleColor.substring(2, 4), 16) : 255,
    b: props.data.paddleColor ? parseInt(props.data.paddleColor.substring(4, 6), 16) : 255,
  });
  const { get } = useFetcher();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload: TokenData | null = jwt_decode(token);

    function checkFriendStatus(meData: UserFriendsData) {
    if (!payload) return;
    if (payload.id === props.data.id) setFriendStatus(relationStatus.ME);
      else if (
        meData.friendsId &&
        meData.friendsId.includes(Number(payload.id))
      )
        setFriendStatus(relationStatus.FRIEND);
      else if (
        meData.requestedId &&
        meData.requestedId.includes(Number(payload.id))
      )
        setFriendStatus(relationStatus.REQUESTED);
      else if (
        meData.blockedById &&
        meData.blockedById.includes(Number(payload.id))
      )
        setFriendStatus(relationStatus.BLOCKED);
      else if (
        meData.blockedId &&
        meData.blockedId.includes(Number(payload.id))
      )
        setFriendStatus(relationStatus.BLOCKEDBY);
      else setFriendStatus(relationStatus.NONE);
    }

    async function fetchData() {
      if (props.data.id === undefined) return;

      try {
        const friendData = await get<UserFriendsData>(`user/friends-data/${props.data.id}`);
        const invitedData = await get<boolean>(`game-invites/has-invited/${props.data.id}`);

        checkFriendStatus(friendData);
        setIsInvitedToGame(invitedData);
      } catch (err) {}
    }

    fetchData().then(() => {});
    ChatClientSocket.onNotificationEvent(fetchData);

    return () => {
      ChatClientSocket.offNotificationEvent(fetchData);
    }
  }, [props.data.id]);

  return (
    <div className={"profile-page"}>
      <div className={"profile-infobox-background"}>
        <div className={"profile-infobox"}>
          <Avatar size="200px" img={props.data.avatarUrl} />
          <div id="info">
            <div id="header">
              <h1 id={"nickname"}>{props.data.nickname}</h1>
            </div>
          </div>
          {friendStatus !== relationStatus.ME ? (
            <div id={"friend-request"}>
              {friendStatus !== relationStatus.BLOCKED ? (
                <FriendRequest
                  data={props.data}
                  status={friendStatus}
                  setStatus={setFriendStatus}
                />
              ) : null}
              <BlockUser
                data={props.data}
                status={friendStatus}
                setStatus={setFriendStatus}
              />
              <InviteToGame
                data={props.data}
                status={isInvitedToGame}
                setStatus={setIsInvitedToGame}
              />
            </div>
          ) : (
            <button
              className="friendButton customization-button"
              onClick={() => setCustomization(!customization)}
            >
              Customization
            </button>
          )}
        </div>
      </div>
      {customization ? (
        <PaddleColor oldColor={oldColor} setOldColor={setOldColor} />
      ) : null}
      <div className={"profile-stats"}>
        <div id={"level"}>
          <div>Level</div>
          <div>{props.data.level}</div>
        </div>
        <div id={"xp"}>
          <div>XP</div>
          <div>{props.data.xp}</div>
        </div>
        <div id={"elo"}>
          <div>ELO</div>
          <div>{props.data.ranking}</div>
        </div>
        <div id={"game-played"}>
          <div>Matches</div>
          <div>{props.data.games?.filter(
            (game) => game.type === GameType.RANKED &&
              (game.status === GameStatus.FINISHED
                || game.status === GameStatus.PLAYER1_DISCONNECTED
                || game.status === GameStatus.PLAYER2_DISCONNECTED)
          ).length}</div>
        </div>
        <div id={"winrate"}>
          <div>Winrate</div>
          <div>{winrate.toFixed()}%</div>
        </div>
      </div>
      <div className={"games-stats-box"}>
        <h5 id={"games-stats-title"}>Match history</h5>
        <hr id={"games-stats-hrbar"} />
        <GameStatsHeader />
        <div className={"matches-table"}>
          {props.data.games?.map((game: GameStats, index) => (
            <div key={index}>
              <GameStatsItem game={game} id={props.data.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
