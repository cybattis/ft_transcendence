import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../components/Auth/dto";

export default function RedirectionPage() {
  const getResponse = async () => {
    await fetch('http://localhost:5400/auth/42', {mode: 'cors', headers: { credentials: 'include' }});
  };
  
  const { setAuthToken } = useContext(AuthContext);
  
  getResponse();

  const location = useLocation();
  const token = location.search.substr(1);

  if (token !== undefined) localStorage.setItem("token", token);
  else console.log(token);

  useEffect(() => {
    setAuthToken(localStorage.getItem("token"));
  }, [setAuthToken]);

  return <Navigate to="/" />;
};