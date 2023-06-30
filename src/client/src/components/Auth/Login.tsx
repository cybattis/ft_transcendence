import React, { useContext } from "react";
import "./Auth.css";
import axios from "axios";
import InputForm from "../InputForm";
import validator from "validator";
import Logo from "../Logo/Logo";
import { AuthContext, FormContext } from "./dto";
import { Navigate } from "react-router-dom";
import { apiBaseURL } from "../../utils/constant";
import logo42 from "../../resource/logo-42.png";

interface SigninDto {
  email: string;
  password: string;
}

export default function Login() {
  const [errorInput, setErrorInput] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setLoginForm, setSignupForm, setCodeForm } = useContext(FormContext);
  const { setAuthToken } = useContext(AuthContext);
  const inputs = {
    email: "",
    password: "",
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    inputs.email = e.currentTarget.email.value;
    inputs.password = e.currentTarget.password.value;
  };

  const validateInput = async () => {
    let isValid = true;
    if (!inputs.email) {
      setErrorInput("Please enter an Email.");
      isValid = false;
    } else if (!validator.isEmail(inputs.email)) {
      setErrorInput("Please enter a valid Email.");
      isValid = false;
    } else if (!inputs.password) {
      setErrorInput("Please enter a Password.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (!(await validateInput())) return;

    const user: SigninDto = {
      email: inputs.email,
      password: inputs.password,
    };

    await axios
      .post(apiBaseURL + "auth/signin", user)
      .then((res) => {
        if (res.status === parseInt("401")) {
          setErrorMessage(res.data.response);
        } else {
          setLoginForm(false);
          if (res.data) {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("id", res.data.id);
            setAuthToken(res.data.token);
          } else if (!res.data) {
            localStorage.setItem("email", user.email);
            setCodeForm(true);
            return;
          }
          return <Navigate to="/" />;
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          setErrorMessage(error.response.data.message);
        } else setErrorMessage("Server busy... try again");
      });
  };

  const intraLink = process.env["REACT_APP_REDIR_URL"];

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Sign in to your account</div>
        {errorInput && <p className="error"> {errorInput} </p>}
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="email" />
          <br />
          <InputForm type="password" name="password" />
          <button type="submit" className="submitButton">
            Login
          </button>
        </form>
        <a className="link42" href={intraLink}>
          <div>Login with</div>
          <img src={logo42} alt="42 logo" width={32} height={32} />
        </a>
        <div className="authFooter">
          <div>New to PongFever?</div>
          <button
            className="bottomLink"
            onClick={() => {
              setSignupForm(true);
              setLoginForm(false);
              setCodeForm(false);
            }}
          >
            Sign up!
          </button>
        </div>
      </div>
    </div>
  );
}
