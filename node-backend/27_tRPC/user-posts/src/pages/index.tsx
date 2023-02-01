import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { trpc } from "../utils/trpc";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const { isLoading, data } = trpc.hello.greeting.useQuery({ name: "hello" });
  const { isLoading: l, data: fromTRPC } = trpc.hello.fromTRPC.useQuery();
  return (
    <div>
      <pre>
        <code>{JSON.stringify({ isLoading, data, fromTRPC, l }, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Home;
