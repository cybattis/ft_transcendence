import React, { useContext, useState } from "react";
import axios from "axios";
import InputForm from "../InputForm";
import Logo from "../Logo/Logo";
import { AuthContext } from "./dto";
import { Navigate } from "react-router-dom";
import "./Auth.css";
import { apiBaseURL } from "../../utils/constant";

type FaProps = {
  showCallback: (value: boolean) => void;
  callback?: (value: boolean) => void;
  callbackValue?: boolean;
};

export default function FaCode(props: FaProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const { setAuthToken } = useContext(AuthContext);

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
      await axios
        .post(apiBaseURL + "auth/2fa/validate", inputs, {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        })
        .then((res) => {
          props.showCallback(false);
          if (props.callback && props.callbackValue !== undefined)
            props.callback(props.callbackValue);
          return;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage("An error occured, please try again.");
            props.showCallback(false);
          }
        });
    } else {
      await axios
        .post(apiBaseURL + "auth/2fa", loggin, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          props.showCallback(false);
          const data = res.data;
          localStorage.setItem("token", data.token);
          setAuthToken(data.token);
          localStorage.removeItem("email");
          return <Navigate to="/" />;
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage("An error occured, please try again.");
            props.showCallback(false);
          }
        });
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
