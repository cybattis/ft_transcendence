import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/Auth/dto";
import { useContext } from "react";

export function HandleTokenError() {
  const { setAuthToken } = useContext(AuthContext);
  localStorage.clear();
  setAuthToken(null);
  return <Navigate to={"/"} />;
}
