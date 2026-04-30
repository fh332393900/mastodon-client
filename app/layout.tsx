import type React from "react"
import type { Metadata } from "next"
import 'tailwindcss/index.css'
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"
import { cookies } from "next/headers"
import { ClientProviders } from "@/components/providers/client-providers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"

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
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("mastodon_token")?.value ?? ""
  const server = cookieStore.get("mastodon_server")?.value ?? process.env.NEXT_PUBLIC_DEFAULT_MASTODON_SERVER ?? "m.webtoo.ls"
  const locale = await getLocale()
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
              <ClientProviders accessToken={accessToken} server={server}>
                {children}
              </ClientProviders>
            </NextIntlClientProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
