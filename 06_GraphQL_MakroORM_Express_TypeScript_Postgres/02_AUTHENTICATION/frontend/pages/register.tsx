import React from "react";
import Input from "../components/Common/Input/Input";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import REGISTER_MUTATION from "../graphql/mutations/register";
interface Props {}
const Register: React.FC<Props> = () => {
  const [register, { data, loading }] = useMutation(REGISTER_MUTATION);
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");

  function registerHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    register({
      variables: {
        registerUser: {
          email,
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
        onSubmit={registerHandler}
      >
        <h1
          style={{
            fontSize: "1rem",
            marginBottom: 5,
            fontWeight: 500,
          }}
        >
          Register
        </h1>
        <Input
          value={username}
          placeholder={"username"}
          type="text"
          error={
            data?.register?.error?.name === "username"
              ? data?.register?.error?.message
              : ""
          }
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          value={email}
          placeholder={"email"}
          type="email"
          error={
            data?.register?.error?.name === "email"
              ? data?.register?.error?.message
              : ""
          }
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          value={password}
          placeholder={"password"}
          type="password"
          error={
            data?.register?.error?.name === "password"
              ? data?.register?.error?.message
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
            Register
          </button>
          <Link href="/login">
            <a
              style={{
                fontSize: ".8rem",
                color: "lightblue",
              }}
            >
              Login
            </a>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
