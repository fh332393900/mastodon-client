import { type NextRequest, NextResponse } from "next/server"
import { getApp, getRedirectURI } from "@/lib/shared"
import { stringifyQuery } from "ufo"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ server: string }> }
) {
  let { server } = await params
  const { origin } = await request.json()
  server = server.toLocaleLowerCase().trim()
  try {
    const app = await getApp(origin, server)
    if (!app || !app.client_id) {
      return NextResponse.json({ error: `App not registered for server: ${server}` }, { status: 400 })
    }

    const query = stringifyQuery({
      client_id: app.client_id,
      scope: "read write follow push",
      response_type: "code",
      redirect_uri: getRedirectURI(origin, server),
    })

    const authUrl = `https://${server}/oauth/authorize?${query}`
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.log(error)
  }
}
