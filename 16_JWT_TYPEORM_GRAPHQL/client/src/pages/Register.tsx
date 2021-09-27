import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Link to="/login">go to login</Link>
      <p>
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </p>
      <p>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </p>
      <button type="submit">register</button>
    </form>
  );
};

export default Register;
