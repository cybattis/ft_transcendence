import { ErrorContext } from "./Modal/modalContext";
import { ErrorResponse } from "../type/client.type";
import { useContext } from "react";
import { AuthContext } from "./Auth/dto";

export function HandleError(props: { error: ErrorResponse }) {
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  if (props.error.response === undefined) {
    localStorage.clear();
    setErrorMessage("Error unknown...");
  } else if (props.error.response.status === 403) {
    localStorage.clear();
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
  } else setErrorMessage(props.error.response.data.message + "!");

  return <></>;
}
