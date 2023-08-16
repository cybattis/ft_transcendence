import React, {createContext, ReactNode, useEffect, useState} from "react";
import Login from "./Login";
import Signup from "./Signup";
import FaCode from "./2fa";

export enum FormState {
  NONE,
  LOGIN,
  SIGNUP,
  TFA_CODE,
  ACCEPT_GAME_INVITE,
}

type FormContextType = {
  formState: FormState;
  setFormState: (newState: FormState) => void;
}

const defaultFormContextState: FormContextType = {
  formState: FormState.NONE,
  setFormState: () => {}
}

export const FormContext = createContext<FormContextType>(defaultFormContextState);

export function FormContextProvider({children}: {children: ReactNode}) {
  const [formState, setFormState] = useState<FormState>(FormState.NONE);

  useEffect(() => {
    const keyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && formState !== FormState.NONE) {
        setFormState(FormState.NONE);
      }
    };

    document.addEventListener("keydown", keyPress);
    return () => document.removeEventListener("keydown", keyPress);
  }, []);

  return (
    <FormContext.Provider value={{formState, setFormState}}>
      {children}
      {formState === FormState.LOGIN ? (
        <Login />
      ) : formState === FormState.SIGNUP ? (
        <Signup />
      ) : formState === FormState.TFA_CODE ? (
        <FaCode />
      ) : null}
    </FormContext.Provider>
  );
}