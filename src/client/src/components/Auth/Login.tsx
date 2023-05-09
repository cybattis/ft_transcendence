import React, { useContext } from "react";
import axios from "axios";
import InputForm from "../InputForm";
import Logo from "../Logo/Logo";
import "./Auth.css";
import { AuthContext, FormContext } from "./dto";
import { Navigate } from "react-router-dom";

interface UserCredential {
  email: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setAuthToken } = useContext(AuthContext);
  const { setLoginForm, setSignupForm } = useContext(FormContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserCredential = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
      remember: e.currentTarget.rememberMe.checked,
    };

    await axios
      .post("http://localhost:5400/auth/signin", user)
      .then((res) => {
        const data = res.data;
        localStorage.setItem("token", data.token);
        setAuthToken(data.token);
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
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="email" />
          <br />
          <InputForm type="password" name="password" />
          {errorMessage !== "" ? <div>{errorMessage}</div> : null}
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
          <button
            className="link"
            onClick={() => {
              setSignupForm(true);
              setLoginForm(false);
            }}
          >
            Sign up!
          </button>
        </div>
      </div>
    </div>
  );
}
