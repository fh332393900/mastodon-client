"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMasto } from "@/components/auth/masto-provider"

export default function FavoritesPage() {
  const router = useRouter()
  const { server } = useMasto()

  useEffect(() => {
    router.replace(`/${server}/favorites`)
  }, [router, server])
  return null
}
