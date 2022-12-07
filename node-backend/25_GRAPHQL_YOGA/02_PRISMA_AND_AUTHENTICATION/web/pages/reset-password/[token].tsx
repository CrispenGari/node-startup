import React from "react";
import { NextPage } from "next";
import Input from "../../components/Common/Input/Input";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import RESET_PASSWORD_MUTATION from "../../graphql/mutations/resetPassword";
import ActivityIndicator from "../../components/Common/ActivityIndicator/ActivityIndicator";

interface Props {
  token: string;
}
const ChangePassword: NextPage<Props> = ({ token }) => {
  const [password, setPassword] = React.useState<string>("");
  const [resetPassword, { data, loading }] = useMutation(
    RESET_PASSWORD_MUTATION
  );
  function resetPasswordHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetPassword({
      variables: {
        resetPasswordEmailInput: {
          newPassword: password,
          token,
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
          position: "relative",
        }}
        onSubmit={resetPasswordHandler}
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
          Change Password
        </h1>
        <Input
          value={password}
          placeholder={"password"}
          type="password"
          error={
            data?.resetPassword?.error
              ? data?.resetPassword?.error?.message
              : ""
          }
          onChange={(e) => setPassword(e.target.value)}
        />
        <p
          style={{
            color: "cornflowerblue",
            fontSize: ".8rem",
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {data?.resetPassword?.user
            ? "Your password was changed please login again."
            : ""}
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

ChangePassword.getInitialProps = async (context) => {
  return {
    token: String(context.query?.token),
  };
};
export default ChangePassword;
