import React, { useContext, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import { FormContext } from "./dto";

export function AuthForms() {
  const { loginForm, setLoginForm, signupForm, setSignupForm } =
    useContext(FormContext);

  const keyPress = (event: KeyboardEvent) => {
    if (event.key === "Escape" && (loginForm || signupForm)) {
      if (loginForm) setLoginForm(false);
      if (signupForm) setSignupForm(false);
      console.log("closing forms");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyPress);
    return () => document.removeEventListener("keydown", keyPress);
  });

  return <>{loginForm ? <Login /> : signupForm ? <Signup /> : null}</>;
}
