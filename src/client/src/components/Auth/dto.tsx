import { createContext } from "react";

export interface FormContextType {
  loginForm: boolean;
  setLoginForm: (value: boolean) => void;
  signupForm: boolean;
  setSignupForm: (value: boolean) => void;
}

export const defaultFormState = {
  loginForm: false,
  setLoginForm: () => {},
  signupForm: false,
  setSignupForm: () => {},
};

export const FormContext = createContext<FormContextType>(defaultFormState);

export interface AuthContextType {
  authed: string | null;
  setAuth: (value: string | null) => void;
}

export const defaultAuthState = {
  authed: localStorage.getItem("token"),
  setAuth: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthState);
