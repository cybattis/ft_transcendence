import {createContext, ReactNode, useState} from "react";

interface AuthContextType {
  authed: boolean,
  setAuthed: (authed: boolean) => void,
}

const defaultAuthContext: AuthContextType = {
  authed: false,
  setAuthed: () => {},
}

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthContextProvider({children}: {children: ReactNode}) {
  const [authed, setAuthed] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{authed, setAuthed}}>
      {children}
    </AuthContext.Provider>
  );
}

