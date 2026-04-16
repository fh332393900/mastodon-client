"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMasto } from "@/components/auth/masto-provider"

export default function TimelinePage() {
  const router = useRouter()
  const { server } = useMasto()

  useEffect(() => {
    router.replace(`/${server}/timeline`)
  }, [router, server])
  return null
}
