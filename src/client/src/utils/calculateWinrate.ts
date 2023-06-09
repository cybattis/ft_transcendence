import { UserInfo } from "../type/user.type";

export function calculateWinrate(props: UserInfo) {
  return props.totalGameWon && props.games?.length
    ? (props.totalGameWon * 100) / props.games?.length
    : 0;
}
