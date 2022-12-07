import { useQuery } from "@apollo/client";
import { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import React from "react";
import Loading from "../components/Loading/Loading";
import Nav from "../components/Nav/Nav";
import USER_QUERY from "../graphql/queries/user";
interface Props {}
const Home: NextPage<Props> = () => {
  const { data: user, loading: loadingUser } = useQuery(USER_QUERY);

  const router = useRouter();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (user?.user && mounted === true && loadingUser === false) {
      router.replace("/");
    }
    if (!user?.user && loadingUser === false) {
      router.replace("/login");
    }
    return () => {
      mounted = false;
    };
  }, [user, loadingUser, router]);
  if (loadingUser) {
    return <Loading />;
  }
  return (
    <div>
      <Nav user={user?.user} />
    </div>
  );
};

export default Home;
