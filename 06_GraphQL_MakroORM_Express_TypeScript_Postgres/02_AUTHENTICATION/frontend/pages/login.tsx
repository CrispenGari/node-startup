import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import React from "react";
import Input from "../components/Common/Input/Input";
import LOGIN_MUTATION from "../graphql/mutations/login";

interface Props {}
const Login: React.FC<Props> = () => {
  const [login, { data, loading }] = useMutation(LOGIN_MUTATION);
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const router = useRouter();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (data?.login?.user && mounted) {
      router.replace("/");
    }
    return () => {
      mounted = false;
    };
  }, [data]);

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login({
      variables: {
        loginUser: {
          username,
          password,
        },
      },
    });
  }
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "#f5f5f5",
      }}
    >
      <form
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "white",
          padding: 20,
          borderRadius: 5,
        }}
        onSubmit={handleLogin}
      >
        <h1
          style={{
            fontSize: "1rem",
            marginBottom: 5,
            fontWeight: 500,
          }}
        >
          Login
        </h1>
        <Input
          value={username}
          placeholder={"username"}
          type="text"
          error={
            data?.login.error?.name === "username"
              ? data?.login.error.message
              : ""
          }
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          value={password}
          placeholder={"password"}
          type="password"
          error={
            data?.login.error?.name === "password"
              ? data?.login.error.message
              : ""
          }
          onChange={(e) => setPassword(e.target.value)}
        />

        <p
          style={{
            justifyContent: "space-between",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            type="submit"
            style={{
              width: 100,
              padding: 10,
              borderRadius: 5,
              outline: "none",
              border: "none",
              cursor: "pointer",
              marginTop: 5,
            }}
          >
            Login
          </button>
          <Link href="/register">
            <a
              style={{
                fontSize: ".8rem",
                color: "lightblue",
              }}
            >
              Register
            </a>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
