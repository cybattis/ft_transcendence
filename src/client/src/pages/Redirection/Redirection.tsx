import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Auth/dto";

export default function RedirectionPage() {
  const { setAuthToken } = useContext(AuthContext);

  const location = useLocation();
  const token = location.search.substr(1);
  localStorage.setItem("token", token);

  useEffect(() => {
    setAuthToken(localStorage.getItem("token"));
  }, [setAuthToken]);

  return <Navigate to="/" />;
}
