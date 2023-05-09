import React, { useContext } from "react";
import axios from "axios";
import Logo from "../Logo/Logo";
import InputForm from "../InputForm";
import "./Auth.css";
import { AuthContext, FormContext } from "./dto";

interface UserCredential {
  nickname: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setSignupForm, setLoginForm } = useContext(FormContext);
  const { setAuthToken } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserCredential = {
      nickname: e.currentTarget.nickname.value,
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    await axios
      .post("http://localhost:5400/auth/signup", user, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        const data = res.data;
        localStorage.setItem("token", data.token);
        setAuthToken(data.token);
        setSignupForm(false);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          if (error.response.data.message.length > 1)
            setErrorMessage(error.response.data.message[0]);
          else setErrorMessage(error.response.data.message);
        } else setErrorMessage("Server busy... try again");
      });
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="nickname" />
          <InputForm type="text" name="email" />
          <InputForm type="password" name="password" />
          <InputForm
            type="password"
            name="confirmPwd"
            label="Confirm password"
          />
          <button type="submit" className="submitButton">
            Signup
          </button>
        </form>
        {errorMessage !== "" ? <div>{errorMessage}</div> : null}
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4&redirect_uri=http%3A%2F%2F127.0.0.1%3A5400%2Fauth%2F42&response_type=code"
          rel="noopener noreferrer"
        >
          Signup with 42
        </a>
        <div className="authFooter">
          <div>Already have an account?</div>
          <button
            className="link"
            onClick={() => {
              setSignupForm(false);
              setLoginForm(true);
            }}
          >
            Sign in!
          </button>
        </div>
      </div>
    </div>
  );
}
