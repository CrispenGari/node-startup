import React from "react";
import { Link, RouteComponentProps, RouteProps } from "react-router-dom";
import {
  useLoginMutation,
  UserDocument,
  UserQuery,
} from "../generated/graphql";

const Login: React.FC<RouteComponentProps> = ({ history }) => {
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
          update: async (cache, { data }) => {
            if (!data) {
              return null;
            }

            await cache.writeQuery<UserQuery>({
              query: UserDocument,
              data: {
                user: data.login.user,
              },
            });
            history.push("/");
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
