import React, { useContext } from "react";
import axios from "axios";
import InputForm from "../../components/InputForm";
import { AuthContext } from "../../components/Auth/dto";
import { useLocation } from "react-router-dom";
import "../../components/Auth/Auth.css";
import jwt_decode from "jwt-decode";
import { TokenData } from "../../type/user.type";

export default function FaCode() {
  const [errorInput, setErrorInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setAuthToken } = useContext(AuthContext);
  const inputs = {
    code: "",
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    inputs.code = e.currentTarget.code.value;
  };

  const location = useLocation();
  const email = location.search.substring(1);

  const isOnlyDigits = async (code: string) => {
    let isValid = true;
    for (let i: number = 0; code[i]; i++) {
      if (code[i] < "0" || code[i] > "9") isValid = false;
    }
    return isValid;
  };

  const validateInput = async () => {
    let isValid = true;
    if (!inputs.code) {
      setErrorInput("Please enter a Code.");
      isValid = false;
    } else if (inputs.code.length !== 4) {
      setErrorInput("The code is a 4 digits number.");
      isValid = false;
    } else if (!(await isOnlyDigits(inputs.code))) {
      setErrorInput("Please enter only a Code with digits.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (!(await validateInput())) return;

    const loggin = {
      code: inputs.code,
      email: email,
    };

    await axios
      .post("http://localhost:5400/auth/2fa", loggin)
      .then((res) => {
        if (res.status === parseInt("401")) {
          setErrorMessage(res.data.response);
        } else {
          const data = res.data;
          localStorage.setItem("token", data.token);
          setAuthToken(data.token);

          const decoded: TokenData = jwt_decode(data.token);
          localStorage.setItem("id", decoded.id.toString());

          return window.location.replace("http://localhost:3000");
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          setErrorMessage(error.response.data.message);
        } else setErrorMessage("Server busy... try again");
      });
  };

  return (
    <div>
      <h3>Enter Your Sign-in Code!</h3>
      <div className="authForm">
        <div className="desc">
          Enter the Confirmation Code that has been sent to you by email.
        </div>
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
