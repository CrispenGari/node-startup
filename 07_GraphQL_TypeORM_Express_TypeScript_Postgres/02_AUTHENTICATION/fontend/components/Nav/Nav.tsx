import { useMutation } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import React from "react";
import LOGOUT_MUTATION from "../../graphql/mutations/logout";
import { User } from "../../types";
import styles from "./Nav.module.css";

interface Props {
  user: User;
}
const Nav: React.FC<Props> = ({ user }) => {
  const [logout, { loading, data }] = useMutation(LOGOUT_MUTATION);
  const router = useRouter();
  function logoutHandler() {
    logout();
  }
  React.useEffect(() => {
    let mounted: boolean = true;
    if (data?.logout) {
      router.replace("/login");
    }
    return () => {
      mounted = false;
    };
  }, [data]);

  return (
    <div className={styles.nav}>
      <div />
      <div>
        <h1>{user?.username}</h1>
        <button onClick={logoutHandler}>logout</button>
      </div>
    </div>
  );
};

export default Nav;
