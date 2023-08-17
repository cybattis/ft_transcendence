import { useTokenSession } from "./UseTokenSession";
import { Fetching } from "../utils/fetching";
import { apiBaseURL } from "../utils/constant";
import {useLocation, useNavigate} from "react-router-dom";
import {useContext} from "react";
import {PopupContext} from "../components/Modal/Popup.context";

export type Fetcher = {
  get: <T = void>(path: string, contentType?: string) => Promise<T>;
  post: <T = void>(path: string, data: any, contentType?: string) => Promise<T>;
  put: <T = void>(path: string, data: any, contentType?: string) => Promise<T>;
  redirectWithError: (error: unknown) => void;
  showErrorInModal: (error: unknown) => void;
}

export function useFetcher(): Fetcher {
  const { setErrorMessage } = useContext(PopupContext);
  const terminateSession = useTokenSession();
  const navigate = useNavigate();
  const location = useLocation();

  function redirectWithError(error: unknown): void {
    if (!Fetching.isFetchingError(error))
      return;

    if (error.isTransportError())
      navigate("no-internet" + location.pathname);
    else if (error.isServerError())
      navigate("server-busy" + location.pathname);
    else if (error.isRequestError() && error.code === 404)
      navigate("not-found" + location.pathname);
    else
      navigate("bad-request" + location.pathname);
  }

  function showErrorInModal(error: unknown): void {
    if (!Fetching.isFetchingError(error))
      return;

    if (error.isTransportError())
      setErrorMessage("You seem to be experiencing internet issues, please try again later");
    else if (error.isServerError())
      setErrorMessage("Server is busy, please try again later");
    else if (!error.isAuthError())
      setErrorMessage(error.message);
  }

  function getData<T = void>(thePath: string, contentType?: string): Promise<T> {
    if (thePath === undefined)
      throw new Fetching.RequestError("Path is undefined", 400);

    return Fetching
      .get<T>(thePath, contentType)
      .catch((err: Fetching.FetchError) => {
        if (err.isAuthError())
          terminateSession();

        throw err;
      });
  }

  function postData<T = void>(thePath: string, data: any, contentType?: string): Promise<T> {
    if (thePath === undefined)
      throw new Fetching.RequestError("Path is undefined", 400);

    return Fetching
      .post<T>(thePath, data, contentType)
      .catch((err: Fetching.FetchError) => {
        if (err.isAuthError())
          terminateSession();

        throw err;
      });
  }

  function putData<T = void>(thePath: string, data: any, contentType?: string): Promise<T> {
    if (thePath === undefined)
      throw new Fetching.RequestError("Path is undefined", 400);

    return Fetching
      .put<T>(thePath, data, contentType)
      .catch((err: Fetching.FetchError) => {
        if (err.isAuthError())
          terminateSession();

        throw err;
      });
  }

  return {
    get: getData,
    post: postData,
    put: putData,
    redirectWithError: redirectWithError,
    showErrorInModal: showErrorInModal
  };
}