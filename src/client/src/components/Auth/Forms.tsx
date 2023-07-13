import React, { useContext, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import { FormContext } from "./dto";
import FaCode from "./2fa";

export function AuthForms() {
  const { loginForm, setLoginForm, signupForm, setSignupForm, codeForm, setCodeForm } =
    useContext(FormContext);

  const keyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape" && (loginForm || signupForm || codeForm )) {
      if (loginForm) setLoginForm(false);
      if (signupForm) setSignupForm(false);
      if (codeForm) setCodeForm(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyPress);
    return () => document.removeEventListener("keydown", keyPress);
  });

  return (
    <>
      {loginForm ? (
        <Login />
      ) : signupForm ? (
        <Signup />
      ) : codeForm ? (
        <FaCode showCallback={setCodeForm}/>
      ) : null}
    </>
  );
}
