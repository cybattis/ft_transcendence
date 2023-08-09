import axios, { AxiosError } from "axios";
import {apiBaseURL} from "./constant";

export namespace Fetching {

  interface IFetchError {
    type: "Transport" | "Server" | "Request" | "Auth",
    message: string,

    isTransportError(): boolean;
    isServerError(): boolean;
    isRequestError(): boolean;
    isAuthError(): boolean;
  }

  export class TransportError implements IFetchError {
    public type: "Transport" = "Transport";
    public message: string;

    constructor(message: string) {
      this.message = message;
    }

    isTransportError(): this is TransportError {
      return true;
    }

    isServerError(): this is ServerError {
      return false;
    }

    isRequestError(): this is RequestError {
      return false;
    }

    isAuthError(): this is AuthError {
      return false;
    }
  }

  export class ServerError implements IFetchError {
    public type: "Server" = "Server";
    public message: string;
    public code: number;

    constructor(message: string, code: number) {
      this.message = message;
      this.code = code;
    }

    isTransportError(): this is TransportError {
      return false;
    }

    isServerError(): this is ServerError {
      return true;
    }

    isRequestError(): this is RequestError {
      return false;
    }

    isAuthError(): this is AuthError {
      return false;
    }
  }

  export class RequestError implements IFetchError {
    public type: "Request" = "Request";
    public message: string;
    public code: number;

    constructor(message: string, code: number) {
      this.message = message;
      this.code = code;
    }

    isTransportError(): this is TransportError {
      return false;
    }

    isServerError(): this is ServerError {
      return false;
    }

    isRequestError(): this is RequestError {
      return true;
    }

    isAuthError(): this is AuthError {
      return false;
    }
  }

  export class AuthError implements IFetchError {
    public type: "Auth" = "Auth";
    public message: string;

    constructor(message: string) {
      this.message = message;
    }

    isTransportError(): this is TransportError {
      return false;
    }

    isServerError(): this is ServerError {
      return false;
    }

    isRequestError(): this is RequestError {
      return false;
    }

    isAuthError(): this is AuthError {
      return true;
    }
  }

  export type FetchError = TransportError | ServerError | RequestError | AuthError;
  export type NonAuthFetchError = TransportError | ServerError | RequestError;

  export function axiosErrorHandler(error: Error | AxiosError): FetchError {
    if (axios.isAxiosError(error)) {
      const code = error.response?.status;
      const data = error.response?.data as any;

      if (code !== undefined) {
        if (code === 401 || code === 403) // Error with authentication
          return new AuthError("Authentication error");
        if (code >= 400 && code < 500) { // Request error

          // Create the error as a BadRequestError
          let errorMessage = "Bad request";

          if (data?.message && data?.message !== "") // If a message was provided, use it
            errorMessage = data.message;
          else if (code === 404) // Provide a message for 404 errors
            errorMessage = "Resource not found";

          return new RequestError(errorMessage, code);
        } else if (code >= 500 && code < 600) { // Server error

          // Create the error as an InternalServerError
          let errorMessage = "Internal server error";

          if (data?.message && data?.message !== "") // If a message was provided, use it
            errorMessage = data.message;

          return new ServerError(errorMessage, code);
        }
      }
    }
    // Else, treat it as a transport error
    return new TransportError(error.message);
  }

  export async function get<T>(path: string, contentType?: string): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = contentType ?
      { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }
      : { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };

    return axios.get<T>(apiBaseURL + path, {
      headers: headers
    }).then(response => {
      return response.data;
    }).catch(axiosError => {
      throw axiosErrorHandler(axiosError);
    });
  }

  export async function post<T>(path: string, data: any, contentType?: string): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = contentType ?
      { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }
      : { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };

    return axios.post(apiBaseURL + path, data, {
      headers: headers
    }).then(response => {
      return response.data;
    }).catch(axiosError => {
      throw axiosErrorHandler(axiosError);
    });
  }

  export async function put<T>(path: string, data: any, contentType?: string): Promise<T> {
    const token = localStorage.getItem("token");
    const headers = contentType ?
      { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }
      : { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };

    return axios.put(apiBaseURL + path, data, {
      headers: headers
    }).then(response => {
      return response.data;
    }).catch(axiosError => {
      throw axiosErrorHandler(axiosError);
    });
  }

  export function isFetchingError(error: any): error is FetchError {
    return error instanceof TransportError
      || error instanceof ServerError
      || error instanceof RequestError
      || error instanceof AuthError;
  }
}