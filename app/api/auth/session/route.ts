export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { getMastodonAuth } from "@/app/api/_lib/mastodon"

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-cache, max-age=0, must-revalidate",
}

/**
 * 返回当前会话的 token 和 server，供客户端 MastoProvider 初始化使用。
 * Cookie 使用 httpOnly 无法由 JS 直接读取，通过此端点安全地暴露给客户端。
 */
export async function GET() {
  const auth = await getMastodonAuth()

  if (!auth) {
    return NextResponse.json(
      { token: "", server: "" },
      { status: 200, headers: RESPONSE_HEADERS },
    )
  }

  return NextResponse.json(
    { token: auth.token, server: auth.server },
    { status: 200, headers: RESPONSE_HEADERS },
  )
}
