"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMasto } from "@/components/auth/masto-provider"

export default function SettingsPage() {
  const router = useRouter()
  const { server } = useMasto()

  useEffect(() => {
    router.replace(`/${server}/settings`)
  }, [router, server])

  return null
}
