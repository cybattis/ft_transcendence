import { createContext } from "react";

interface ErrorContextType {
  errorMessage: string;
  setErrorMessage: (value: string) => void;
}

export const defaultErrorContext: ErrorContextType = {
  errorMessage: "",
  setErrorMessage: () => {},
};

export const ErrorContext =
  createContext<ErrorContextType>(defaultErrorContext);
