import React from "react";
import Logo from "../Logo/Logo";
import "./Login.css";
import InputForm from "./InputForm";

export default function Login() {
  return (
    <div className="background">
      <div className="loginForm">
        <Logo />
        <div className="desc">Sign in to your account</div>
        <form method="post">
          <InputForm type="text" name="email" />
          <br />
          <InputForm type="text" name="password" />
          <div className="formOption">
            <label>
              <input type="checkbox" name="rememberMe" defaultChecked={false} />
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

        <div className="noAccount">
          <div>New to PongFever?</div>
          <a className="signup" href="blank" target="_blank">
            Sign up!
          </a>
        </div>
      </div>
    </div>
  );
}
