import React, { useContext } from "react";
import InputForm from "../InputForm/InputForm";
import validator from "validator";
import Logo from "../Logo/Logo";
import { Navigate } from "react-router-dom";
import "./Auth.css";
import { AuthContext } from "./auth.context";
import { useFetcher } from "../../hooks/UseFetcher";

const maxCode: number = 10;

export default function ConfirmEmail() {
  const [errorInput, setErrorInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setAuthed } = useContext(AuthContext);
  const { post, showErrorInModal } = useFetcher();
  const inputs = {
    code: "",
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    inputs.code = e.currentTarget.code.value;
  };

  const validateInput = async () => {
    let isValid = true;
    if (!validator.isInt(inputs.code)) {
      setErrorInput("The code is only digits.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (!(await validateInput())) return;

    const code = inputs.code;

    await post<string>("auth/signin", code)
      .then(newToken => {
        localStorage.setItem("token", newToken);
        setAuthed(true);
        return <Navigate to="/" />;
      })
      .catch(showErrorInModal);
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Enter the confirmation code</div>
        {errorInput && <p className="error"> {errorInput} </p>}
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="Confirmation Code" maxLength={maxCode}/>
          <br />
          <button type="submit" className="submitButton">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
