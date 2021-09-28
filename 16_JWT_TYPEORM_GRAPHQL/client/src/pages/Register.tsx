import React from "react";
import { Link } from "react-router-dom";
import {
  UserDocument,
  useRegisterMutation,
  UserQuery,
} from "../generated/graphql";

const Register = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [register] = useRegisterMutation();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await register({
          variables: {
            email,
            password,
          },
          update: (cache, { data }) => {
            if (!data) {
              return null;
            }
            cache.writeQuery<UserQuery>({
              query: UserDocument,
              data: {
                user: data.register.user,
              },
            });
          },
        });
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
