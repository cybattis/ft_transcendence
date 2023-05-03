import React, { FormEvent } from "react";
import "./Auth.css";
import Logo from "../Logo/Logo";
import InputForm from "../InputForm";
import { Authed, LoggedInProps } from "../../App";
import { useNavigate } from "react-router-dom";

interface UserCredential {
  username: string;
  password: string;
  remember: boolean;
}

export default function Login(props: LoggedInProps & Authed) {
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user: UserCredential = {
      username: event.currentTarget.nickname.value,
      password: event.currentTarget.password.value,
      remember: event.currentTarget.rememberMe.checked,
    };
    console.log(user);

    // hash password
    // send data to API
    // if all good go to home logged

    props.loggedInCallback(true);
    props.loginFormCallback(false);

    navigate("/");
  }

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Sign in to your account</div>
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="nickname" />
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
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-edf712168eec4256ee4f78ca683cdc411e0d71b7cafcff73b1876feb3f229d47&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code"
          target="_blank"
          rel="noopener noreferrer"
        >
          Login with
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
