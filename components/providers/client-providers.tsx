"use client"

import type React from "react"
import { ReactQueryProvider } from "./react-query-provider"
import { ClientIntlProvider } from "./intl-provider"
import { MastoProvider } from "@/components/auth/masto-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ClientIntlProvider>
        <MastoProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MastoProvider>
      </ClientIntlProvider>
    </ReactQueryProvider>
  )
}
