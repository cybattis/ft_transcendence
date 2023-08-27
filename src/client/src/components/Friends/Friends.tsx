import React, { useEffect, useState } from "react";
import "./Friends.css";
import { Avatar } from "../Avatar";
import { Link } from "react-router-dom";
import { ChatClientSocket } from "../../pages/Chat/Chat-client";
import { UserFriend } from "../../type/user.type";
import { useFetcher } from "../../hooks/UseFetcher";

function Online(props: { inGame: boolean }) {
  return (
    <div className="online">
      <div className="status">{props.inGame ? "In game" : "In menu"}</div>
    </div>
  );
}

function Offline() {
  return <div className="offline"></div>;
}

function FriendsList() {
  const [friendsStatus, setFriendsStatus] = useState<UserFriend[]>([]);
  const { get } = useFetcher();

  useEffect(() => {
    async function fetchFriendsStatus() {
      await get<UserFriend[]>("user/friends/status")
        .then(friends => setFriendsStatus(friends))
        .catch(() => {});
    }
    fetchFriendsStatus();

    ChatClientSocket.onNotificationEvent(fetchFriendsStatus);

    return () => {
      ChatClientSocket.offNotificationEvent(fetchFriendsStatus);
    }
  }, []);

  if (friendsStatus && friendsStatus[0]) {
    return (
      <>
        <h4>Friends</h4>
        <>
          {friendsStatus.map((friendData) => {
            return (
              <div className="friends" key={friendData.nickname}>
                <Link
                  to={`/profile/nickname/${friendData.nickname}`}
                  className="friendLink"
                >
                  <div>
                    <p className="friendsImg">
                      <Avatar size="50px" img={friendData.avatarUrl} />
                    </p>
                    {friendData.online ? <Online inGame={friendData.inGame} /> : <Offline />}
                  </div>
                  <p className="nickname">{friendData.nickname}</p>
                </Link>
              </div>
            );
          })}
        </>
      </>
    );
  } else return <h4>No Friends</h4>;
}

export function Friends() {
  return (
    <div className="friendList">
      <FriendsList />
    </div>
  );
}
