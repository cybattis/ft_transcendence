import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTokenSession } from "./UseTokenSession";
import { Fetching } from "../utils/fetching";

/*
  * useData is a hook that asynchronously fetches data with GET from the API and returns it.
  * It will cause a re-render if either data is fetched or an error occurs.
  *
  * @param path The path to fetch data from. If undefined, no data will be fetched.
  *
  * @returns - data The data fetched from the API.
  *          - error The error message if an error occurred.
  *          - fetchData A function that can be called to manually fetch data from the API.
 */
export function useData<T>(path?: string, redirectOnError?: true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Fetching.NonAuthFetchError | null>(null);
  const terminateSession = useTokenSession();
  const navigate = useNavigate();
  const location = useLocation();

  function redirectWithError(error: Fetching.FetchError): void {
    if (error.isTransportError())
      navigate("no-internet" + location.pathname);
    else if (error.isServerError())
      navigate("server-busy" + location.pathname);
    else if (error.isRequestError() && error.code === 404)
      navigate("not-found" + location.pathname);
    else
      navigate("bad-request" + location.pathname);
  }

  function errorHandler(error: Fetching.FetchError) {
    if (error.isAuthError())
      terminateSession();
    else if (redirectOnError)
      redirectWithError(error);
    else
      setError(error);
  }

  function fetchData(thePath: string) {
    if (thePath === undefined) {
      return;
    }

    Fetching.get<T>(thePath)
      .then((res: T) => { setData(res); })
      .catch(errorHandler);
  }

  useEffect(() => {
    if (path !== undefined)
      fetchData(path);
  }, [path]);

  return { data, error };
}