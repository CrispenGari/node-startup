import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { trpc } from "../utils/trpc";
import superjson from "superjson";
import { createWSClient, wsLink } from "@trpc/client";
import { AppRouter } from "server";
const getEndingLink = () => {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: "http://localhost:3001/api/trpc",
    });
  }

  const client = createWSClient({
    url: "ws://localhost:3001/api/trpc",
  });

  return wsLink<AppRouter>({
    client,
  });
};
interface Props {
  children: React.ReactNode;
}
const TRPCProvider: React.FC<Props> = ({ children }) => {
  const links = [loggerLink(), getEndingLink()];
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
