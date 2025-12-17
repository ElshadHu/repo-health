"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { TRPCProvider } from "@/trpc/client";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
