import {createContext, ReactNode, useState} from "react";

interface AuthContextType {
  authed: boolean,
  tfaActivated: boolean,
  setAuthed: (authed: boolean) => void,
  setTfaActivated: (authed: boolean) => void,
}

const defaultAuthContext: AuthContextType = {
  authed: false,
  tfaActivated: false,
  setAuthed: () => {},
  setTfaActivated: () => {},
}

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthContextProvider({children}: {children: ReactNode}) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [tfaActivated, setTfaActivated] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{authed, tfaActivated, setAuthed, setTfaActivated}}>
      {children}
    </AuthContext.Provider>
  );
}

