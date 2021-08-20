import React from "react";
import { NextPage } from "next";
import Input from "../components/Common/Input/Input";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import REQUEST_RESET_PASSWORD_MUTATION from "../graphql/mutations/requetsResetPassword";
import ActivityIndicator from "../components/Common/ActivityIndicator/ActivityIndicator";

interface Props {}
const ResetPassword: NextPage<Props> = () => {
  const [email, setEmail] = React.useState<string>("");

  const [sendEmail, { data, loading }] = useMutation(
    REQUEST_RESET_PASSWORD_MUTATION
  );
  function requestResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendEmail({
      variables: {
        sendEmailEmail: email,
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
          position: "relative",
        }}
        onSubmit={requestResetPassword}
      >
        {loading ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              background: "rgba(0, 0, 0, .3)",
              zIndex: 10,
              borderRadius: 5,
              display: "grid",
              placeItems: "center",
            }}
          >
            <ActivityIndicator />
          </div>
        ) : null}
        <h1
          style={{
            fontSize: "1rem",
            marginBottom: 5,
            fontWeight: 500,
          }}
        >
          Reset Password
        </h1>
        <Input
          value={email}
          placeholder={"email"}
          type="email"
          error={data?.sendEmail?.error ? data?.sendEmail?.error?.message : ""}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p
          style={{
            color: "cornflowerblue",
            fontSize: ".8rem",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {data?.sendEmail?.message ? data?.sendEmail?.message : null}
        </p>
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
            Reset Password
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

export default ResetPassword;
