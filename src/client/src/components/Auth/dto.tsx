import { createContext } from "react";

interface FormContextType {
  loginForm: boolean;
  setLoginForm: (value: boolean) => void;
  signupForm: boolean;
  setSignupForm: (value: boolean) => void;
  codeForm: boolean;
  setCodeForm: (value: boolean) => void;
  chatForm: boolean;
  setChatForm: (value: boolean) => void;
}

export const defaultFormState: FormContextType = {
  loginForm: false,
  setLoginForm: () => {},
  signupForm: false,
  setSignupForm: () => {},
  codeForm: false,
  setCodeForm: () => {},
  chatForm: false,
  setChatForm: () => {},
};

export const FormContext = createContext<FormContextType>(defaultFormState);

interface AuthContextType {
  authed: string | null;
  setAuthToken: (value: string | null) => void;
}

export const defaultAuthState: AuthContextType = {
  authed: localStorage.getItem("token"),
  setAuthToken: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthState);

interface NotifContextType {
  notif: boolean;
  setNotif: (value: boolean) => void;
}

export const defaultNotifState: NotifContextType = {
  notif: false,
  setNotif: () => {},
};

export const NotifContext = createContext<NotifContextType>(defaultNotifState);
