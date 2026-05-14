"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { mastodon } from "masto";
import { createRestAPIClient } from "masto"

export type MastoClient = mastodon.rest.Client
export type MastoStreamingClient = mastodon.streaming.Client
export interface MastoContextType {
  client: MastoClient
  server: string
  accessToken: string
  streamingClient?: MastoStreamingClient
  isReady: boolean
}

const MastoContext = createContext<MastoContextType | undefined>(undefined);

const DEFAULT_SERVER =
  process.env.NEXT_PUBLIC_DEFAULT_MASTODON_SERVER ?? "m.webtoo.ls"

export function useMasto() {
  const ctx = useContext(MastoContext);
  if (!ctx) {
    throw new Error("Masto client not initialized. Wrap your app with <MastoProvider>.");
  }
  return ctx;
}

export function MastoProvider({ children }: { children: React.ReactNode }) {
  // SSR / hydration 阶段统一使用默认值，避免 hydration mismatch。
  // mastodon_token / mastodon_server 是 httpOnly cookie，JS 无法直接读取，
  // 通过 /api/auth/session 端点安全地获取。
  const [token, setToken] = useState("")
  const [server, setServer] = useState(DEFAULT_SERVER)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ token: t, server: s }: { token: string; server: string }) => {
        if (t) setToken(t)
        if (s) setServer(s)
      })
      .catch(() => {/* 未登录或网络错误，保持默认值 */})
  }, [])

  const client = useMemo(
    () => createRestAPIClient({ url: `https://${server}`, accessToken: token }),
    [server, token]
  )

  return (
    <MastoContext.Provider value={{ client: client as MastoClient, server, accessToken: token, isReady: true }}>
      {children}
    </MastoContext.Provider>
  )
}
