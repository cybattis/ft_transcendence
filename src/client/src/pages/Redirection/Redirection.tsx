import { Navigate, useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { TokenData } from "../../type/user.type";

export default function RedirectionPage() {
  const location = useLocation();
  const token: string = location.search.substring(1);

  if (token !== undefined && token !== null)
    localStorage.setItem("token", token);

  const decoded: TokenData = jwt_decode(token);
  localStorage.setItem("id", decoded.id.toString());

  return <Navigate to="/" />;
}
