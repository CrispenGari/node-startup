import React from "react";
import { NextPage } from "next";
import Input from "../../components/Common/Input/Input";
import Link from "next/link";

interface Props {}
const ChangePassword: NextPage<Props> = () => {
  const [password, setPassword] = React.useState<string>("");
  function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
        onSubmit={resetPassword}
      >
        <h1
          style={{
            fontSize: "1rem",
            marginBottom: 5,
            fontWeight: 500,
          }}
        >
          Change Password
        </h1>
        <Input
          value={password}
          placeholder={"password"}
          type="password"
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
              width: "fit-content",
              padding: 10,
              borderRadius: 5,
              outline: "none",
              border: "none",
              cursor: "pointer",
              marginTop: 5,
            }}
          >
            change password
          </button>
          <Link href="/login">
            <a
              style={{
                fontSize: ".8rem",
                color: "lightblue",
              }}
            >
              Back to Login
            </a>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ChangePassword;
