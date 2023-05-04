import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Auth/dto";

export default function RedirectionPage() {
  const { setAuth } = useContext(AuthContext);

  const location = useLocation();
  const token = location.search.substr(1);
  localStorage.setItem("token", token);

  useEffect(() => {
    setAuth(localStorage.getItem("token"));
  }, [setAuth]);

  return <Navigate to="/" />;
}
