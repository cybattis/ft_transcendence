import React, { useContext } from "react";
import axios from "axios";
import InputForm from "../InputForm";
import validator from 'validator';
import Logo from "../Logo/Logo";
import { AuthContext, FormContext } from "./dto";
import { Navigate } from "react-router-dom";
import "./Auth.css";

interface UserCredential {
  email: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const [errorInput, setErrorInput] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const { setAuth } = useContext(AuthContext);
  const { setLoginForm } = useContext(FormContext);
  const inputs = {
    email: '',
    password: '',
    remember: false
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    inputs.email = e.currentTarget.email.value;
    inputs.password = e.currentTarget.password.value;
    inputs.remember = e.currentTarget.rememberMe.checked;
  }

  const validateInput = async () => {
    let isValid = true;
      if (!inputs.email) {
        setErrorInput("Please enter an Email.");
        isValid = false;
      }
      else if (!validator.isEmail(inputs.email)) {
        setErrorInput("Please enter a valid Email.");
        isValid = false;
      }
      else if (!inputs.password) {
        setErrorInput("Please enter a Password.");
        isValid = false;
      }
    return isValid;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (! await validateInput())
      return ;

    const user: UserCredential = {
      email: inputs.email,
      password: inputs.password,
      remember: inputs.remember,
    };

    await axios
      .post("http://localhost:5400/auth/signin", user)
      .then((res) => {
        const data = res.data;
        localStorage.setItem("token", data.token);
        setAuth(data.token);
        setLoginForm(false);
        return <Navigate to="/" />;
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
        <div className="desc">Sign in to your account</div>
        {errorInput && <p className="error"> {errorInput} </p>}
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="email" />
          <br />
          <InputForm type="password" name="password" />
          <div className="formOption">
            <label>
              <input
                type="checkbox"
                name="rememberMe"
                value="false"
                defaultChecked={false}
              />
              Remember me
            </label>
            <a className="forgetPassLink" href="blank" target="_blank">
              Forgot your password?
            </a>
          </div>
          <button type="submit" className="submitButton">
            Login
          </button>
        </form>
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4&redirect_uri=http%3A%2F%2F127.0.0.1%3A5400%2Fauth%2F42&response_type=code"
          rel="noopener noreferrer"
        >
          Login with 42
        </a>
        <div className="authFooter">
          <div>New to PongFever?</div>
          <a className="link" href="blank" target="_blank">
            Sign up!
          </a>
        </div>
      </div>
    </div>
  );
}
