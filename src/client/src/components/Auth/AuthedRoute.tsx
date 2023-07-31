import {ReactElement, ReactNode, useContext, useEffect, useState} from "react";
import { AuthContext } from "./auth.context";
import { Navigate } from "react-router-dom";
import Loading from "react-loading";
import {ErrorContext} from "../Modal/modalContext";
import axios from "axios";
import {apiBaseURL} from "../../utils/constant";

interface AuthedRouteProps {
  component: ReactElement,
}

export function AuthedRoute({component}: AuthedRouteProps) {
  const { authed, setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const [ loading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    if (authed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setAuthed(false);
      setErrorMessage("Session expired, please login again!");
      return;
    }

    axios
      .get(apiBaseURL + "auth/token-validation", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }).then((res) => {
      setAuthed(true);
      console.log("token valid");
    }).catch((error) => {
      setAuthed(false);
      console.log("token invalid");
      setErrorMessage("Your session has expired, please log in again.");
      localStorage.removeItem("token");
      return <Navigate to="/"/>;
    });
  }, []);

  return authed ? component : ( loading ? <Loading/> : <Navigate to={"/"}/>);
}