import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { trpc } from "../utils/trpc";
import superjson from "superjson";
interface Props {
  children: React.ReactNode;
}
const TRPCProvider: React.FC<Props> = ({ children }) => {
  const links = [
    loggerLink(),
    httpBatchLink({
      url: "http://localhost:3001/api/trpc",
    }),
  ];
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
      transformer: superjson,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TRPCProvider;
