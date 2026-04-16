import type React from "react"
import type { Metadata } from "next"
import 'tailwindcss/index.css'
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"
import { cookies } from "next/headers";
import { MastoProvider } from "@/components/auth/masto-provider";
import { AuthProvider } from "@/components/auth/auth-provider"

export const metadata: Metadata = {
  title: "Mastodon Client - Connect to the Fediverse",
  description: "A modern, beautiful Mastodon client with rich animations and premium dark theme",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies();

  const accessToken = (await cookieStore).get("mastodon_token")?.value ?? ""
  const server = (await cookieStore).get("mastodon_server")?.value ?? "mastodon.social"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased overflow-y-scroll`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
            <MastoProvider accessToken={accessToken} server={server}>
              <AuthProvider>
                {children}
              </AuthProvider>
            </MastoProvider>
          </ThemeProvider>
        </Suspense>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
