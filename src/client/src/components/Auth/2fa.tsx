import React, {useContext, useState} from "react";
import InputForm from "../InputForm/InputForm";
import Logo from "../Logo/Logo";
import { Navigate } from "react-router-dom";
import "./Auth.css";
import {AuthContext} from "./auth.context";
import {FormContext, FormState} from "./form.context";
import { useFetcher } from "../../hooks/UseFetcher";

const maxCode: number = 10;

export default function FaCode() {
  const [errorMessage, setErrorMessage] = useState("");
  const { tfaActivated, setAuthed, setTfaActivated } = useContext(AuthContext);
  const { setFormState } = useContext(FormContext);
  const { post, showErrorInModal } = useFetcher();

  const inputs = {
    code: "",
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    inputs.code = e.currentTarget.code.value;
  };

  const isOnlyDigits = async (code: string) => {
    return code.match(/^[0-9]+$/) != null;
  };

  const validateInput = async () => {
    let isValid = true;
    if (!inputs.code) {
      setErrorMessage("Please enter a Code.");
      isValid = false;
    } else if (inputs.code.length !== 4) {
      setErrorMessage("The code is a 4 digits number.");
      isValid = false;
    } else if (!(await isOnlyDigits(inputs.code))) {
      setErrorMessage("Please enter only a Code with digits.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (!(await validateInput())) return;

    const token: string | null = localStorage.getItem("token");
    let email: string | null = localStorage.getItem("email");

    let loggin = {
      code: inputs.code,
      email: email,
    };

    if (token) {
      await post<true>("auth/2fa/validate", inputs, "application/json")
        .then(() => setTfaActivated(!tfaActivated))
        .catch(showErrorInModal);
        setFormState(FormState.NONE);
    } else {
      await post<string>("auth/2fa", loggin, "application/json")
        .then(newToken => {
          setTfaActivated(true);
          setAuthed(true);
          setFormState(FormState.NONE);
          localStorage.setItem("token", newToken);
          localStorage.removeItem("email");
          return <Navigate to="/" />;
        })
        .catch(showErrorInModal);
        setFormState(FormState.NONE);
    }
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">
          Enter the Confirmation Code that has been sent to you by email.
        </div>
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="code" maxLength={maxCode} />
          <br />
          <button type="submit" className="submitButton">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
