import {createContext, ReactNode, useState} from "react";

export enum FormState {
  NONE,
  LOGIN,
  SIGNUP,
  TFA_CODE
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

  return (
    <FormContext.Provider value={{formState, setFormState}}>
      {children}
    </FormContext.Provider>
  );
}