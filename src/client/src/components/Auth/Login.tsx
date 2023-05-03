import React from "react";
import axios from 'axios';
import Logo from "../Logo/Logo";
import "./Auth.css";

export default function Login() {
  const inputStyle = {
    display: "flex",
    flexDirection: "row" as "row",
    boxSizing: "border-box" as "border-box",
    alignItems: "center",

    padding: "10px 14px",
    marginBottom: "5px",
    gap: "8px",

    width: "358px",
    height: "46px",

    color: "var(--black)",
    background: "white",
    borderRadius: "8px",
    border: "none",
    outline: 0,
  };

  const [errrorMessage, setErrorMessage] = React.useState('');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    var body = {
      email: form.email,
      password: form.password
    }

    const { data } = await axios.post("http://localhost:5400/auth/signin", body);
    if (data.status === parseInt('401')) {
      setErrorMessage(data.response);
      console.log(errrorMessage);
    } else {
      localStorage.setItem('token', data.token);
      console.log(data);
      //setIsLoggedIn(true)
    }
  }

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Sign into your account</div>
        <form method="post" onSubmit={handleSubmit}>
          <label>
            Email <br />
            <input style={inputStyle} type="text" name="email" id="email" value={form.email} onChange={handleChange}/>
          </label>
          <label>
            Password <br />
            <input style={inputStyle} type="password" name="password" id="password" value={form.password} onChange={handleChange}/>
          </label>
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
