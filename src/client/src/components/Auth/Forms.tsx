import React, {useContext, useEffect} from "react";
import Login from "./Login";
import Signup from "./Signup";
import FaCode from "./2fa";
import {FormContext, FormState} from "./form.context";

export function AuthForms() {
  const { formState, setFormState } = useContext(FormContext);

  const keyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape" && formState !== FormState.NONE) {
        setFormState(FormState.NONE);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyPress);
    return () => document.removeEventListener("keydown", keyPress);
  });

  return (
    <>
      {formState === FormState.LOGIN ? (
        <Login />
      ) : formState === FormState.SIGNUP ? (
        <Signup />
      ) : formState === FormState.TFA_CODE ? (
        <FaCode />
      ) : null}
    </>
  );
}
