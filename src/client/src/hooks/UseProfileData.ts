import {useData} from "./UseData";
import {UserInfo} from "../type/user.type";

export function useProfileData() {
  const { data, error} = useData<UserInfo>("user/my-profile");
  return { data, error };
}