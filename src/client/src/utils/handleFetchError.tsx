import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/Auth/dto";
import { useContext } from "react";

export function HandleTokenError() {
  const { setAuthToken } = useContext(AuthContext);
  localStorage.removeItem("token");
  localStorage.removeItem("id");
  setAuthToken(null);
  return <Navigate to={"/"} />;
}
