"use client"

import type React from "react"
import { ReactQueryProvider } from "./react-query-provider"
import { MastoProvider } from "@/components/auth/masto-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

interface ClientProvidersProps {
  children: React.ReactNode
  accessToken: string
  server: string
}

/**
 * 所有需要在客户端初始化的 Provider 统一放在这里。
 * accessToken / server 由父级 Server Component（layout.tsx）通过 cookies() 读取后传入，
 * 避免在客户端用 document.cookie + useEffect 造成的初始化闪烁。
 */
export function ClientProviders({ children, accessToken, server }: ClientProvidersProps) {
  return (
    <ReactQueryProvider>
      <MastoProvider accessToken={accessToken} server={server}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MastoProvider>
    </ReactQueryProvider>
  )
}
