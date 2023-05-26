import { createContext } from "react";

export interface FormContextType {
  loginForm: boolean;
  setLoginForm: (value: boolean) => void;
  signupForm: boolean;
  setSignupForm: (value: boolean) => void;
  codeForm: boolean;
  setCodeForm: (value: boolean) => void;
}

export const defaultFormState: FormContextType = {
  loginForm: false,
  setLoginForm: () => {},
  signupForm: false,
  setSignupForm: () => {},
  codeForm: false,
  setCodeForm: () => {},
};

export const FormContext = createContext<FormContextType>(defaultFormState);

export interface AuthContextType {
  authed: string | null;
  setAuthToken: (value: string | null) => void;
}

export const defaultAuthState: AuthContextType = {
  authed: localStorage.getItem("token"),
  setAuthToken: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthState);