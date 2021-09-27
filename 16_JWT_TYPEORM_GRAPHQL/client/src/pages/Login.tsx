import React from "react";
import { Link } from "react-router-dom";
import {
  useLoginMutation,
  UserDocument,
  UserQuery,
} from "../generated/graphql";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [login] = useLoginMutation({ fetchPolicy: "network-only" });
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await login({
          variables: {
            email,
            password,
          },
          update: (store, { data }) => {
            if (!data) {
              return null;
            }

            store.writeQuery<UserQuery>({
              query: UserDocument,
              data: {
                user: data.login.user,
              },
            });
          },
        });
      }}
    >
      <Link to="/register">go to register</Link>
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
      <button type="submit">login</button>
    </form>
  );
};

export default Login;
