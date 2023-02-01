import { useRouter } from "next/router";
import React from "react";
import { trpc } from "../utils/trpc";

const Home = () => {
  const { data, isLoading } = trpc.user.me.useQuery();
  const { mutate } = trpc.user.logout.useMutation();
  const router = useRouter();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !isLoading) {
      if (!!!data) {
        router.replace("/login");
      } else {
        router.replace("/");
      }
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return <div>loading...</div>;
  }

  const logout = () => {
    mutate();
    router.reload();
  };
  return (
    <div>
      <pre>
        <code>{JSON.stringify({ isLoading, data }, null, 2)}</code>
      </pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
