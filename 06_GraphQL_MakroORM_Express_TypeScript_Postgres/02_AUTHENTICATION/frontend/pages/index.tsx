import { useQuery } from "@apollo/client";
import { useRouter } from "next/dist/client/router";
import React from "react";
import Loading from "../components/Loading/Loading";
import USER_QUERY from "../graphql/queries/user";
const Home = () => {
  const { data: user, loading: loadingUser } = useQuery(USER_QUERY);

  const router = useRouter();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (user?.user && mounted === true && loadingUser === false) {
      router.replace("/");
    } else {
      router.replace("/login");
    }
    return () => {
      mounted = false;
    };
  }, [user, loadingUser]);

  if (loadingUser) {
    return <Loading />;
  }
  return (
    <div>
      <h1>Hello, Next</h1>
    </div>
  );
};

export default Home;
