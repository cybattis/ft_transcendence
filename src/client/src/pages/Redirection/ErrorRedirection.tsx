import { clientBaseURL } from "../../utils/constant";

export function ErrorRedirection() {
  window.location.href = clientBaseURL;
  return <></>;
}
