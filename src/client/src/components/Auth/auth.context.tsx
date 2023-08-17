import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useFetcher } from "../../hooks/UseFetcher";

interface AuthContextType {
  authed: boolean;
  isAuthing: boolean;
  tfaActivated: boolean;
  setAuthed: (authed: boolean) => void;
  setIsAuthing(authing: boolean): void;
  setTfaActivated: (authed: boolean) => void;
}

const defaultAuthContext: AuthContextType = {
  authed: false,
  isAuthing: false,
  tfaActivated: false,
  setAuthed: () => {},
  setIsAuthing: () => {},
  setTfaActivated: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [isAuthing, setIsAuthing] = useState<boolean>(!authed);
  const [tfaActivated, setTfaActivated] = useState<boolean>(false);
  const { get } = useFetcher();
  const token = localStorage.getItem("token");

  function setAuthedFunction(authed: boolean) {
    setIsAuthing(false);
    setAuthed(authed);
  }

  useEffect(() => {
    if (!token) {
      setIsAuthing(false);
      return;
    }

    get<true>("auth/token-validation")
      .then(res => {
        setAuthed(true);
        setIsAuthing(false);
      })
      .catch(() => setIsAuthing(false));
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authed,
        isAuthing,
        tfaActivated,
        setAuthed: setAuthedFunction,
        setIsAuthing,
        setTfaActivated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
