"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { mastodon } from "masto";
import { createRestAPIClient } from "masto"

export type MastoClient = mastodon.rest.Client
export type MastoStreamingClient = mastodon.streaming.Client
export interface MastoContextType {
  client: MastoClient
  server: string
  streamingClient?: MastoStreamingClient
}

const MastoContext = createContext<MastoContextType | undefined>(undefined);

export function useMasto() {
  const client = useContext(MastoContext);
  if (!client) {
    throw new Error("Masto client not initialized. Wrap your app with <MastoProvider>.");
  }
  return client;
}

export function MastoProvider({ children, accessToken, server }: { children: React.ReactNode, accessToken: string, server: string }){
  const [client, setClient] = useState<MastoClient>()

  useEffect(() => {
    const c = createRestAPIClient({
      url: `https://${server}`,
      accessToken,
    })
    setClient(c)

    console.log(client, '*************')
  }, [server, accessToken])

  return (
    <MastoContext.Provider value={{ client: client as MastoClient, server: server }}>
      {children}
    </MastoContext.Provider>
  )
}
