import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Auth/dto";

export default function RedirectionPage() {
  const { setAuthToken } = useContext(AuthContext);

  const location = useLocation();
  const token = location.search.substring(1);

  if (token !== undefined) localStorage.setItem("token", token);
  else console.log(token);

  useEffect(() => {
    setAuthToken(localStorage.getItem("token"));
  }, [setAuthToken]);

  return <Navigate to="/" />;
}
