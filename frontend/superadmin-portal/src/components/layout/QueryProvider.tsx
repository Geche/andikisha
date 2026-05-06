"use client";

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => console.error("[query error]", error),
        }),
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
          mutations: {
            onError: (error) => console.error("[mutation error]", error),
          },
        },
      })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
