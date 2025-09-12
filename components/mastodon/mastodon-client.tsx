"use client"

import { createRestAPIClient } from "masto"
import { useState, useEffect } from "react"

interface MastodonClientConfig {
  url: string
  accessToken?: string
}

export class MastodonClientManager {
  private static instance: MastodonClientManager
  private client: any = null
  private config: MastodonClientConfig | null = null

  static getInstance(): MastodonClientManager {
    if (!MastodonClientManager.instance) {
      MastodonClientManager.instance = new MastodonClientManager()
    }
    return MastodonClientManager.instance
  }

  async connect(config: MastodonClientConfig) {
    try {
      this.config = config
      this.client = createRestAPIClient({
        url: config.url,
        accessToken: config.accessToken,
      })
      return true
    } catch (error) {
      console.error("Failed to connect to Mastodon:", error)
      return false
    }
  }

  async getTimeline(type: "home" | "public" | "local" = "public") {
    if (!this.client) {
      // Return mock data for guest mode
      return this.getMockTimeline()
    }

    try {
      switch (type) {
        case "home":
          return await this.client.v1.timelines.home.list()
        case "local":
          return await this.client.v1.timelines.public.list({ local: true })
        default:
          return await this.client.v1.timelines.public.list()
      }
    } catch (error) {
      console.error("Failed to fetch timeline:", error)
      return this.getMockTimeline()
    }
  }

  private getMockTimeline() {
    // Return the mock data we defined earlier
    return []
  }

  isConnected(): boolean {
    return this.client !== null
  }

  getConfig(): MastodonClientConfig | null {
    return this.config
  }

  disconnect() {
    this.client = null
    this.config = null
  }
}

export function useMastodonClient() {
  const [client] = useState(() => MastodonClientManager.getInstance())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setIsConnected(client.isConnected())
  }, [client])

  const connect = async (config: MastodonClientConfig) => {
    const success = await client.connect(config)
    setIsConnected(success)
    return success
  }

  const disconnect = () => {
    client.disconnect()
    setIsConnected(false)
  }

  return {
    client,
    isConnected,
    connect,
    disconnect,
  }
}
