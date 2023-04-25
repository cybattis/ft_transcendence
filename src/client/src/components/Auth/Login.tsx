import React from "react";
import axios from 'axios';
import Logo from "../Logo/Logo";
import "./Auth.css";
import InputForm from "../InputForm";

export default function Login() {
  const [form, setForm] = React.useState({
    email: '',
    password: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(form.email);
    console.log(form.password);

    axios.get('http://loclahost:5400/user/' + form.email + '/' + form.password)
    .then(res => {
      console.log(res);
    });
  }

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Sign into your account</div>
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="email" id="email" value={form.email} onChange={handleChange} />
          <br />
          <InputForm type="password" name="password" id="password" value={form.password} onChange={handleChange}/>
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
