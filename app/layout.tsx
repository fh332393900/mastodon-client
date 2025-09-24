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
import { createRestAPIClient } from "masto"


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

  const accessToken = (await cookieStore).get("mastodon_token")?.value ?? "";
  const server = (await cookieStore).get("mastodon_server")?.value ?? "mastodon.social";
  console.log(accessToken, 1)
  console.log(server, 2)
  const client = createRestAPIClient({
    url: `https://${server}`,
    accessToken: accessToken,
  })
  console.log(client)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
            <MastoProvider client={client}>
              {children}
            </MastoProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
