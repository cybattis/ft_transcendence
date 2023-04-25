import React from "react";
import axios from 'axios';
import Logo from "../Logo/Logo";
import "./Auth.css";

export default function Signup() {
  const [form, setForm] = React.useState({
    nickname: '',
    firstName: '',
    LastName: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    axios.post('http://loclahost:5400/auth', {form})
    .then(res => {
      console.log(res);
    });
  }

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        <form onSubmit={handleSubmit}>
          <input type="text" name="nickname" id="nickname" value={form.nickname} onChange={handleChange}/>
          <div className="halfInput">
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="LastName"
              id="LastName"
              value={form.LastName}
              onChange={handleChange}
            />
          </div>
          <input type="text" name="email" id="email" value={form.email} onChange={handleChange}/>
          <input type="password" name="password" id="password" value={form.password} onChange={handleChange}/>
          <input
            type="password"
            name="confirmPwd"
            id="confirmpassword"
            value={form.confirmpassword}
            onChange={handleChange}
          />
          <button type="submit" className="submitButton">
            Signup
          </button>
        </form>
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-edf712168eec4256ee4f78ca683cdc411e0d71b7cafcff73b1876feb3f229d47&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code"
          target="_blank"
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
  /*return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        <form method="post">
          <InputForm type="text" name="nickname" id="nickname" value={form.nickname} onChange={handleChange}/>
          <div className="halfInput">
            <InputForm
              type="text"
              name="firstName"
              id="firstName"
              value={form.firstName}
              onChange={handleChange}
              label="First name"
              half={true}
            />
            <InputForm
              type="text"
              name="LastName"
              id="LastName"
              value={form.LastName}
              onChange={handleChange}
              label="Last name"
              half={true}
            />
          </div>
          <InputForm type="text" name="email" id="email" value={form.email} onChange={handleChange}/>
          <InputForm type="password" name="password" id="password" value={form.password} onChange={handleChange}/>
          <InputForm
            type="password"
            name="confirmPwd"
            id="confirmpassword"
            value={form.confirmpassword}
            onChange={handleChange}
            label="Confirm password"
          />
          <button type="submit" className="submitButton">
            Signup
          </button>
        </form>
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-edf712168eec4256ee4f78ca683cdc411e0d71b7cafcff73b1876feb3f229d47&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code"
          target="_blank"
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
  );*/
}
