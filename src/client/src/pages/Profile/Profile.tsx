import { useLoaderData } from "react-router-dom";

interface User {
  id: number;
  nickname: string;
  firstname: string;
  lastname: string;
}

export function Profile() {
  let data = useLoaderData() as User;

  return (
    <>
      <div>Profile</div>
      <div>{data.id}</div>
      <div>{data.nickname}</div>
      <div>{data.firstname}</div>
      <div>{data.lastname}</div>
    </>
  );
}
