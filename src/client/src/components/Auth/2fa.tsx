import React, { useContext } from "react";
import axios from "axios";
import InputForm from "../InputForm";
import Logo from "../Logo/Logo";
import { AuthContext } from "./dto";
import { Navigate } from "react-router-dom";
import "./Auth.css";

type FaProps = {
  showCallback: (value: boolean) => void;
  callback?: (value: boolean) => void;
  callbackValue?: boolean;
}

export default function FaCode(props: FaProps) {
  const [errorInput, setErrorInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const { authed, setAuthToken } = useContext(AuthContext);

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
      email: localStorage.getItem("email"),
    };

    await axios
      .post("http://" + process.env["REACT_APP_API_IP"] + ":5400/auth/2fa", loggin, {
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        props.showCallback(false);
        if (res.status === parseInt("401")) {
          setErrorMessage(res.data.response);
        } else if (!authed) {
          const data = res.data;
          localStorage.setItem("id", data.id);
          localStorage.setItem("token", data.token);
          setAuthToken(data.token);
          localStorage.removeItem("email");
          return <Navigate to="/" />;
        } else {
          if (props.callback && props.callbackValue !== undefined)
            props.callback(props.callbackValue);
          return;
        }
      })
      .catch((error) => {
        props.showCallback(false);
        if (error.response && error.response.status === 401) {
          setErrorMessage(error.response.data.message);
        } else setErrorMessage("Server busy... try again");
      });
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
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
