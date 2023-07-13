import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Auth/dto";

export default function RedirectionPage() {
  const location = useLocation();
  const { setAuthToken } = useContext(AuthContext);
  const token: string = location.search.substring(1);

  if (token !== undefined && token !== null)
    localStorage.setItem("token", token);

  useEffect(() => {
    setAuthToken(token);
  }, [setAuthToken, token]);

  return <Navigate to="/" />;
}
