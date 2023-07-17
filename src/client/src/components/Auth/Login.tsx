import React, { useContext } from "react";
import "./Auth.css";
import axios from "axios";
import InputForm from "../InputForm";
import validator from "validator";
import Logo from "../Logo/Logo";
import { AuthContext, FormContext } from "./dto";
import { apiBaseURL } from "../../utils/constant";
import logo42 from "../../resource/logo-42.png";

interface SigninDto {
  email: string;
  password: string;
}

export default function Login() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setLoginForm, setSignupForm, setCodeForm } = useContext(FormContext);
  const { setAuthToken } = useContext(AuthContext);
  const inputs: SigninDto = {
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
      setErrorMessage("Please enter an Email.");
      isValid = false;
    } else if (!validator.isEmail(inputs.email)) {
      setErrorMessage("Please enter a valid Email.");
      isValid = false;
    } else if (!inputs.password) {
      setErrorMessage("Please enter a Password.");
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
        setLoginForm(false);
        if (res.data === "code") {
          localStorage.setItem("email", user.email);
          setCodeForm(true);
        } else {
          localStorage.setItem("token", res.data.token);
          setAuthToken(res.data.token);
        }
        return;
      })
      .catch((error) => {
        if (error.response === undefined) {
          localStorage.clear();
          setErrorMessage("Error unknown...");
        } else setErrorMessage(error.response.data.message + "!");
      });
  };

  const intraLink = process.env["REACT_APP_REDIR_URL"];

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Sign in to your account</div>
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
