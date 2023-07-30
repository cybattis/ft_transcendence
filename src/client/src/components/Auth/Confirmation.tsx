import React, { useContext } from "react";
import axios from "axios";
import InputForm from "../InputForm";
import validator from "validator";
import Logo from "../Logo/Logo";
import { Navigate } from "react-router-dom";
import "./Auth.css";
import { apiBaseURL } from "../../utils/constant";
import { AuthContext } from "./auth.context";

export default function ConfirmEmail() {
  const [errorInput, setErrorInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setAuthed } = useContext(AuthContext);
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

    await axios
      .post(apiBaseURL + "auth/signin", code)
      .then((res) => {
        const data = res.data;
        localStorage.setItem("token", data.token);
        setAuthed(true);
        return <Navigate to="/" />;
      })
      .catch((error) => {
        if (error.response.status === 401) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Server busy... try again");
          console.log(error);
        }
      });
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Enter the confirmation code</div>
        {errorInput && <p className="error"> {errorInput} </p>}
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="Confirmation Code" />
          <br />
          <button type="submit" className="submitButton">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
