import type { AppInfo } from '@/types'
import { kv } from '@vercel/kv'
import fetch from 'node-fetch'
import { agent } from '@/lib/proxy-agent'

export function getRedirectURI(origin: string, server: string) {
  origin = origin.replace(/\?.*$/, '')
  return `${origin}/api/${server}/oauth/${encodeURIComponent(origin)}`
}

async function fetchAppInfo(origin: string, server: string) {
  console.log(origin, 'origin')
  const form = new URLSearchParams();
  form.append("client_name", "v0-mastodon-client");
  form.append("redirect_uris", getRedirectURI(origin, server));
  form.append("scopes", "read write follow push");
  form.append("website", "https://v0-mastodon-client.vercel.app");

  try {
    const res = await fetch(`https://${server}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString(),
      agent: agent as any
    })
    const app: AppInfo = await res.json() as AppInfo
    return app
  } catch (error: any) {
    console.log(error.stack || error
      , '****fetchAppInfo error****')
  }
  
}

export async function getApp(origin: string, server: string) {
  const host = origin.replace(/^https?:\/\//, '').replace(/\W/g, '-').replace(/\?.*$/, '')
  const key = `servers:v3:${server}:${host}.json`.toLowerCase()
  try {
    if (await kv.get(key))
      return (kv.get(key) as Promise<AppInfo>)
    const appInfo = await fetchAppInfo(origin, server)
    await kv.set(key, appInfo)
    return appInfo
  }
  catch {
    return null
  }
}

export async function deleteApp(server: string) {
  const keys: any = (await kv.get(`servers:v3:${server}:`))
  for (const key of keys)
    await kv.del(key)
}

export async function listServers() {
  const keys: any = await kv.get('servers:v3:')
  const servers = new Set<string>()
  for await (const key of keys) {
    const id = key.split(':')[2]
    if (id)
      servers.add(id.toLocaleLowerCase())
  }
  return Array.from(servers).sort()
}
