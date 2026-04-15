import { cookies } from "next/headers"
import { createRestAPIClient } from "masto"

export function normalizeServerUrl(server: string) {
  if (server.startsWith("http://") || server.startsWith("https://")) {
    return server
  }

  return `https://${server}`
}

export async function getMastodonAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get("mastodon_token")?.value
  const server = cookieStore.get("mastodon_server")?.value

  if (!token || !server) {
    return null
  }

  return {
    token,
    server,
    url: normalizeServerUrl(server),
  }
}

export async function getMastodonClient() {
  const auth = await getMastodonAuth()

  if (!auth) {
    return null
  }
  return createRestAPIClient({
    url: auth.url,
    accessToken: auth.token,
  })
}

export async function getScopedMastodonClient(server: string) {
  const auth = await getMastodonAuth()
  console.log(auth, 'auth========')
  const url = normalizeServerUrl(server)

  return createRestAPIClient({
    url,
    accessToken: auth?.server === server ? auth.token : undefined,
  })
}
