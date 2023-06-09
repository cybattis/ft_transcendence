import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../components/Auth/dto";

export default function RedirectionPage() {
  const { setAuthToken } = useContext(AuthContext);

  const location = useLocation();
  const token: string = location.search.substring(1);

  if (token !== undefined && token !== null)
    localStorage.setItem("token", token);
  else console.log(token);

  setAuthToken(localStorage.getItem("token"));
  return <Navigate to="/" />;
}
