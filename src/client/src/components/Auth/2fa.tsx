import React, { useContext } from "react";
import axios from "axios";
import InputForm from "../InputForm";
import Logo from "../Logo/Logo";
import { AuthContext } from "./dto";
import { Navigate } from "react-router-dom";
import { FormContext } from "./dto";
import "./Auth.css";

export default function FaCode() {
  const [errorInput, setErrorInput] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const { setAuthToken } = useContext(AuthContext);
  const { setCodeForm } = useContext(FormContext);
  const inputs = {
    code: ''
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    inputs.code = e.currentTarget.code.value;
  }

  const isOnlyDigits = async (code: string) => {
    let isValid = true;
    for (let i: number = 0; code[i]; i++)
    {
        if (code[i] < '0' || code[i] > '9')
          isValid = false;
    }
    return isValid;
  }

  const validateInput = async () => {
    let isValid = true;
      if (!inputs.code) {
        setErrorInput("Please enter a Code.");
        isValid = false;
      }
      else if (inputs.code.length != 4) {
        setErrorInput("The code is a 4 digits number.");
        isValid = false;
      }
      else if (await isOnlyDigits(inputs.code) === false) {
        setErrorInput("Please enter only a Code with digits.");
        isValid = false;
      }
    return isValid;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (! await validateInput())
      return ;

    const loggin = {
        code: inputs.code,
        email: localStorage.getItem('email'),
    }

    console.log(loggin);

    await axios
      .post("http://localhost:5400/auth/2fa", loggin)
      .then((res) => {
        if (res.status === parseInt('401')) {
          setErrorMessage(res.data.response);
        } else {
          const data = res.data;
          localStorage.setItem("token", data.token);
          setAuthToken(data.token);
          setCodeForm(false);
          localStorage.removeItem('email');
          return <Navigate to="/" />;
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          setErrorMessage(error.response.data.message);
        } else setErrorMessage("Server busy... try again");
      });
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Enter the Confirmation Code</div>
        {errorInput && <p className="error"> {errorInput} </p>}
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="code" />
          <br />
          <button type="submit" className="submitButton">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
