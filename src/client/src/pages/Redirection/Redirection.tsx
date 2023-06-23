import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../components/Auth/dto";
import jwt_decode from "jwt-decode";
import { TokenData } from "../../type/user.type";

export default function RedirectionPage() {
  const { setAuthToken } = useContext(AuthContext);
  const location = useLocation();
  const token: string = location.search.substring(1);

  if (token !== undefined && token !== null)
    localStorage.setItem("token", token);

  setAuthToken(localStorage.getItem("token"));

  const decoded: TokenData = jwt_decode(token);
  localStorage.setItem("id", decoded.id.toString());

  return <Navigate to="/" />;
}
