import { redirect } from "next/navigation"

export default async function ServerIndexPage({
  params,
}: {
  params: Promise<{ server: string }>
}) {
  const { server } = await params
  redirect(`/${server}/timeline`)
}
