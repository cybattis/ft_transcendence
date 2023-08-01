import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import {AuthContext} from "../../components/Auth/auth.context";
import {ErrorContext} from "../../components/Modal/modalContext";

export default function RedirectionPage() {
  const location = useLocation();
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  useEffect(() => {
    const token: string = location.search.substring(1);
    if (token.length > 0) {
      localStorage.setItem("token", token);
      setAuthed(true);
    } else {
      setErrorMessage("Invalid token, please login again!");
      setAuthed(false);
    }
  }, []);

  return <Navigate to="/" />;
}
