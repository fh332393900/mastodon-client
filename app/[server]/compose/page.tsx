import { Suspense } from "react"
import { ComposePage } from "@/components/mastodon/ComposePage"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ComposePage />
    </Suspense>
  )
}
