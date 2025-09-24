"use client";

import { createContext, useContext } from "react";
import type { mastodon } from "masto";

export type MastoClient = mastodon.rest.Client;

const MastoContext = createContext<MastoClient | null>(null);

export function useMasto() {
  const client = useContext(MastoContext);
  if (!client) {
    throw new Error("Masto client not initialized. Wrap your app with <MastoProvider>.");
  }
  return client;
}

export function MastoProvider({ children, client }: { children: React.ReactNode, client: MastoClient }){
  return (
    <MastoContext.Provider value={client}>
      {children}
    </MastoContext.Provider>
  )
}
