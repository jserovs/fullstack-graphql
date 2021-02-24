import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../gql/queries";

const LoginForm = ({ show, setUser}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login] = useMutation(LOGIN);

  const loginButtonClicked = async (event) => {
    event.preventDefault();
    var result;

    try {
      result = await login({ variables: { username, password }});
    } catch (error) {
      setUsername("");
      setPassword("");
      alert("Wrong credentials");
    }

    if (result) {
      setUser(result.data.login.value);
      localStorage.setItem('user-token',result.data.login.value)
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>Log in to application</h2>
      <form>
        <div>
          username:
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
        </div>
        <div>
          password:
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </div>
        <div>
          <button onClick={loginButtonClicked}>login</button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
