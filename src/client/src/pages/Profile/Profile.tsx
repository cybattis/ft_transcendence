import { useLoaderData } from "react-router-dom";
import { UserProfileDto } from "../../type/user.type";

export function Profile() {
  let data = useLoaderData() as UserProfileDto;

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
