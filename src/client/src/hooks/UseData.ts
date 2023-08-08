import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { apiBaseURL } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { useTokenSession } from "./UseTokenSession";

interface IErrorBase {
  error: Error | AxiosError;
  type: 'axios-error' | 'stock-error';
}

interface IAxiosError extends IErrorBase {
  error: AxiosError;
  type: 'axios-error';
}
interface IStockError extends IErrorBase {
  error: Error;
  type: 'stock-error';
}

interface IFetchError  {
  type: "Transport" | "Server" | "Request",
  message: string,
}

interface ITransportFetchError extends IFetchError {
  type: "Transport",
  message: string,
}

interface IServerFetchError extends IFetchError {
  type: "Server",
  message: string,
  code: number,
}

interface IRequestFetchError extends IFetchError {
  type: "Request",
  message: string,
  code: number,
}

export function isTransportError(fetchError: IFetchError): fetchError is ITransportFetchError {
  return fetchError.type === "Transport";
}

export function isServerError(fetchError: IFetchError): fetchError is IServerFetchError {
  return fetchError.type === "Server";
}

export function isRequestError(fetchError: IFetchError): fetchError is IRequestFetchError {
  return fetchError.type === "Request";
}

export function axiosErrorHandler(
  callback: (err: IAxiosError | IStockError) => void
) {
  return (error: Error | AxiosError) => {
    if (axios.isAxiosError(error)) {
      callback({
        error: error,
        type: 'axios-error'
      });
    } else {
      callback({
        error: error,
        type: 'stock-error'
      });
    }
  };
}

/*
  * useData is a hook that asynchronously fetches data with GET from the API and returns it.
  * It will cause a re-render if either data is fetched or an error occurs.
  *
  * @param path The path to fetch data from. If undefined, no data will be fetched.
  * @param publicData If true, the data will be fetched without a token.
  *
  * @returns - data The data fetched from the API.
  *          - error The error message if an error occurred.
  *          - fetchData A function that can be called to manually fetch data from the API.
 */
export function useData<T>(path?: string, publicData?: true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<IFetchError | null>(null);
  const terminateSession = useTokenSession();
  const navigate = useNavigate();

  const errorHandler = axiosErrorHandler(res => {
    if (res.type === 'axios-error') {
      const code = res.error.response?.status;
      const data = res.error.response?.data as any;

      if (code !== undefined) {
        if (code === 401 || code === 403) // Error with authentication
          return terminateSession();
        if (code >= 400 && code < 500) { // Request error

          // Create the error as a BadRequestError
          const requestError: IRequestFetchError = {
            type: "Request",
            message: "Bad request",
            code: code,
          }

          if (data?.message && data?.message !== "") // If a message was provided, use it
            requestError.message = data.message;
          else if (code === 404) // Provide a message for 404 errors
            requestError.message = "Resource not found";

          setError(requestError);
          return;
        } else if (code >= 500 && code < 600) { // Server error

          // Create the error as an InternalServerError
          const serverError: IServerFetchError = {
            type: "Server",
            message: "Internal server error",
            code: code,
          }

          if (data?.message && data?.message !== "") // If a message was provided, use it
            serverError.message = data.message;

          setError(serverError);
          return;
        }
      }
      // If no code was provided, treat it as a transport error
    }
    setError({type: "Transport", message: res.error.message});
  });

  function fetchData(thePath: string) {
    if (thePath === undefined) {
      return;
    }

    const token: string | null = localStorage.getItem("token");
    if (!token && !publicData) {
      navigate("/");
      return;
    }

    axios
      .get(apiBaseURL + thePath, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }).then(res => { setData(res.data); }
      ).catch(errorHandler);
  }

  useEffect(() => {
    if (path !== undefined)
      fetchData(path);
  }, []);

  return {data, error, fetchData};
}