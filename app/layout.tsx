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
import { ReactQueryProvider } from "@/components/providers/react-query-provider"
import { NextIntlClientProvider } from "next-intl"
import { localeCookieName, resolveLocaleFromCookie } from "@/app/i18n"
import { getMessages } from "next-intl/server"

export const metadata: Metadata = {
  title: "Mastodon Client - Connect to the Fediverse",
  description: "A modern, beautiful Mastodon client with rich animations and premium dark theme",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()

  const accessToken = (await cookieStore).get("mastodon_token")?.value ?? ""
  const server = (await cookieStore).get("mastodon_server")?.value ?? process.env.DEFAULT_MASTODON_SERVER ?? "m.webtoo.ls"
  const locale = resolveLocaleFromCookie((await cookieStore).get(localeCookieName)?.value)
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased overflow-y-scroll`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ReactQueryProvider>
                <MastoProvider accessToken={accessToken} server={server}>
                  <AuthProvider>
                    {children}
                  </AuthProvider>
                </MastoProvider>
              </ReactQueryProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </Suspense>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
