import { Navigate, useLoaderData } from "react-router-dom";
import { UserInfo } from "../../type/user.type";

export function Profile() {
  let data = useLoaderData() as UserInfo;
  if (localStorage.getItem("token") === null) {
    return <Navigate to="/" />;
  }

  console.log("Profile: ", data);

  const style = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    height: "var(--page-height)",
  };

  return (
    <div style={style}>
      <div>Profile</div>
      <div>nickname: {data.nickname}</div>
      <div>level: {data.level}</div>
      <div>xp: {data.xp}</div>
      <div>ranking: {data.ranking}</div>
      <div>Game played: {data.games?.length}</div>
      <div>Winrate: 0%</div>
    </div>
  );
}
