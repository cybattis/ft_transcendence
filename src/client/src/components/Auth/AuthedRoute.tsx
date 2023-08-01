import {ReactElement, useContext} from "react";
import { AuthContext } from "./auth.context";
import { Navigate } from "react-router-dom";
import {LoadingPage} from "../../pages/Loading/LoadingPage";

interface AuthedRouteProps {
  component: ReactElement,
}

export function AuthedRoute({component}: AuthedRouteProps) {
  const { authed, isAuthing } = useContext(AuthContext);

  return authed ? component : ( isAuthing ? <LoadingPage/> : <Navigate to={"/"}/>);
}