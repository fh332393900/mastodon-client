"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle, ArrowRight, Loader2, Users, Code2, Shield, Globe, Cpu, Zap } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

const POPULAR_SERVERS = [
  {
    name: "Mastodon Social",
    host: "mastodon.social",
    desc: "官方旗舰站，最大实例",
    icon: Globe,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    dot: "bg-violet-400",
    users: "12M+",
  },
  {
    name: "Mastodon Online",
    host: "mastodon.online",
    desc: "面向大众的通用实例",
    icon: Users,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    dot: "bg-indigo-400",
    users: "800K+",
  },
  {
    name: "Fosstodon",
    host: "fosstodon.org",
    desc: "开源与技术爱好者",
    icon: Code2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    users: "50K+",
  },
  {
    name: "Infosec Exchange",
    host: "infosec.exchange",
    desc: "信息安全从业者聚集地",
    icon: Shield,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    dot: "bg-rose-400",
    users: "30K+",
  },
  {
    name: "Webtoo.ls",
    host: "m.webtoo.ls",
    desc: "技术与极客爱好者",
    icon: Cpu,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    dot: "bg-sky-400",
    users: "10K+",
  },
  {
    name: "Hachyderm",
    host: "hachyderm.io",
    desc: "科技工作者与创作者",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    users: "40K+",
  },
]

interface LoginModalProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LoginModal({ children, open, onOpenChange }: LoginModalProps) {
  const [server, setServer] = useState("")
  const [internalOpen, setInternalOpen] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const isControlled = typeof open !== "undefined"
  const dialogOpen = isControlled ? open : internalOpen
  const handleOpenChange = (value: boolean) => {
    if (!isControlled) setInternalOpen(value)
    onOpenChange?.(value)
  }

  const handleLogin = async () => {
    if (!server) {
      setError("请输入服务器地址")
      return
    }
    setError("")
    await login(server)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-border/60 bg-card shadow-2xl shadow-black/20">
        {/* Header gradient strip */}
        <div className="relative px-7 pt-7 pb-2 bg-gradient-to-b from-primary/6 to-transparent border-b border-border/50">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">登录 Mastodon</DialogTitle>
            </div>
            <p className="text-center text-[13px] text-muted-foreground">
              选择下方热门服务器，或手动输入你的实例地址
            </p>
          </DialogHeader>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="px-7 pb-4 space-y-3"
        >
          {/* 热门服务器卡片 */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">热门实例</p>
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_SERVERS.map((s) => {
                const Icon = s.icon
                const isSelected = server === s.host
                return (
                  <button
                    key={s.host}
                    type="button"
                    disabled={isLoading}
                    onClick={() => { setServer(s.host); setError("") }}
                    className={cn(
                      "group cursor-pointer relative flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-all duration-200",
                      "hover:border-primary/50 hover:bg-primary/4 hover:shadow-sm",
                      isSelected
                        ? "border-primary/60 bg-primary/6 shadow-sm ring-1 ring-primary/20"
                        : "border-border/70 bg-background/60",
                      isLoading && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {/* active dot */}
                    {isSelected && (
                      <span className={cn("absolute top-2 right-2 h-1.5 w-1.5 rounded-full", s.dot)} />
                    )}
                    {/* icon */}
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-md flex items-center justify-center mb-0.5", s.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", s.color)} />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground leading-tight">{s.name}</span>
                    </div>
                    <span className={cn("text-[10px] font-medium leading-tight", s.color)}>{s.host}</span>
                    <div className="flex items-center justify-between w-full mt-0.5">
                      <span className="text-[9.5px] text-muted-foreground leading-snug line-clamp-1">{s.desc}</span>
                      <span className={cn("text-[9px] font-semibold shrink-0 ml-1", s.color)}>{s.users}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[11px] text-muted-foreground/50 font-medium tracking-wide uppercase">
                或手动输入
              </span>
            </div>
          </div>

          {/* 手动输入 */}
          <div className="space-y-2">
            <Label htmlFor="server" className="text-[12px] font-medium text-muted-foreground">服务器地址</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/60 select-none font-mono">
                https://
              </span>
              <Input
                id="server"
                type="text"
                placeholder="mastodon.social"
                value={server}
                onChange={(e) => { setServer(e.target.value); setError("") }}
                onKeyDown={handleKeyDown}
                className="pl-[4.2rem] h-10 text-sm rounded-lg bg-background/80 border-border/70 transition-all duration-200 focus-visible:ring-primary/30"
                disabled={isLoading}
              />
              {server && !isLoading && (
                <button
                  type="button"
                  onClick={() => { setServer(""); setError("") }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[12px] text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5 flex items-center gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-destructive shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleLogin}
            disabled={!server || isLoading}
            className="w-full h-10 rounded-lg font-medium text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                正在跳转...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                登录
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground/50">
            还没有账号？前往{" "}
            <a href="https://joinmastodon.org" target="_blank" rel="noreferrer" className="text-primary/70 hover:text-primary underline-offset-2 hover:underline transition-colors">
              joinmastodon.org
            </a>{" "}
            注册
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
