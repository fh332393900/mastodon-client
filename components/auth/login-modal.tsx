"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle, ArrowRight, Loader2, User, Lock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  children: React.ReactNode
}

export function LoginModal({ children }: LoginModalProps) {
  const [server, setServer] = useState('');
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!server) {
      setError("Please enter server address!")
      return
    }
    const res = await fetch(`/api/${server}/login`, {
      method: 'POST',
      body: JSON.stringify({
        origin: location.origin,
      })
    })
    const { authUrl } = await res.json()
    console.log(authUrl)
    location.href = authUrl
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">Sign In</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter your credentials to access your Mastodon timeline
          </DialogDescription>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-xs text-accent font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">alice/password • bob/password • carol/password</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server" className="text-sm font-medium">
                Server
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  https://
                </span>
                <Input
                  id="server"
                  type="text"
                  placeholder=""
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-18 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!server || isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 text-primary-foreground font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary-foreground" />
                <span className="text-primary-foreground">Signing In...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2 text-primary-foreground" />
                <span className="text-primary-foreground">Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2 text-primary-foreground" />
              </>
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
