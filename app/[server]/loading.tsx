import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container px-4 py-6">
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <div className="ml-2 text-sm text-primary">Loading...</div>
      </div>
    </div>
  )
}
