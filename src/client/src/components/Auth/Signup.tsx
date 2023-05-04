import React from "react";
import axios from "axios";
import Logo from "../Logo/Logo";
import InputForm from "../InputForm";
import "./Auth.css";

interface UserCredential {
  nickname: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [errrorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserCredential = {
      nickname: e.currentTarget.nickname.value,
      firstname: e.currentTarget.firstname.value,
      lastname: e.currentTarget.lastname.checked,
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    const { data } = await axios.post(
      "http://localhost:5400/auth/signup",
      user,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    if (data.status === parseInt("401")) {
      setErrorMessage(data.response);
      console.log(errrorMessage);
    } else {
      localStorage.setItem("token", data.token);
    }
  };

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="nickname" />
          <div className="halfInput">
            <InputForm
              type="text"
              name="firstname"
              label="First name"
              half={true}
            />
            <InputForm
              type="text"
              name="lastname"
              label="Last name"
              half={true}
            />
          </div>
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
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4&redirect_uri=http%3A%2F%2F127.0.0.1%3A5400%2Fauth%2F42&response_type=code"
          rel="noopener noreferrer"
        >
          Signup with 42
        </a>
        <div className="authFooter">
          <div>Already have an account?</div>
          <a className="link" href="blank" target="_blank">
            Sign in!
          </a>
        </div>
      </div>
    </div>
  );
}
