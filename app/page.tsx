"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/auth/login-modal"
import { MessageCircle, Users, Globe, Zap, Shield, Heart, ArrowRight, Sparkles, Bell, Search, Hash } from "lucide-react"
import { useMasto } from "@/components/auth/masto-provider"

export default function HomePage() {
  const router = useRouter()
  const { server, accessToken } = useMasto()

  // 已登录直接跳转
  useEffect(() => {
    if (accessToken) {
      router.replace(`/${server}/timeline`)
    }
  }, [accessToken, router, server])

  const handleGuestMode = () => {
    router.push(`/${server}/timeline`)
  }

  // 跳转中不渲染页面，避免闪烁
  if (accessToken) return null

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">MastoClient</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>去中心化社交网络</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                更好的方式<br />体验{" "}
                <span className="text-primary">Mastodon</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                简洁、快速、现代化的 Mastodon 客户端。无算法推送，无广告追踪，真正属于你的社交空间。
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              {[
                { icon: Zap, text: "极速响应", color: "text-yellow-500" },
                { icon: Shield, text: "隐私优先", color: "text-green-500" },
                { icon: Heart, text: "开放源码", color: "text-red-500" },
              ].map((feature) => (
                <div key={feature.text} className="flex items-center space-x-2 bg-card border border-border/60 rounded-full transition-transform duration-200 hover:scale-[1.02]">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* 统计数字 */}
            <div className="flex gap-8 pt-2">
              {[
                { value: "10M+", label: "活跃用户" },
                { value: "10K+", label: "独立实例" },
                { value: "100%", label: "无广告" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 登录卡片 */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl">
              <CardHeader className="text-center space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold">开始使用</CardTitle>
                <CardDescription className="text-muted-foreground">
                  登录你的 Mastodon 账号，或以访客身份浏览
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LoginModal>
                  <Button className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20 text-primary-foreground font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    登录账号
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </LoginModal>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">或</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleGuestMode}
                  className="w-full h-11 border-border text-muted-foreground hover:bg-muted/50 transition-all duration-300 bg-transparent"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  以访客身份浏览
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  访客模式仅可浏览公共内容，无法互动
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 功能特性 */}
        <section className="mt-28 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl lg:text-4xl font-bold">为什么选择 MastoClient？</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              专为现代 Web 打造，注重细节与用户体验。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "实时时间轴",
                description: "清晰的时间轴视图，快速浏览本地、联邦与主页动态，支持无限滚动加载。",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Users,
                title: "用户悬浮卡片",
                description: "鼠标悬停用户名即可查看资料、关注状态，一键关注/取消关注，无需跳转页面。",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Hash,
                title: "话题 & 提及",
                description: "撰写时输入 # 或 @ 即触发搜索建议，快速插入话题标签和用户提及。",
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
              {
                icon: Bell,
                title: "通知中心",
                description: "统一管理点赞、转发、提及、新关注者等所有通知，不遗漏每一条互动。",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
              {
                icon: Search,
                title: "探索发现",
                description: "浏览热门话题、趋势标签和推荐账号，发现联邦宇宙中有趣的内容与人。",
                color: "text-purple-500",
                bg: "bg-purple-500/10",
              },
              {
                icon: Zap,
                title: "极速性能",
                description: "基于 Next.js 构建，滚动位置缓存、懒加载图片，流畅体验从不妥协。",
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
            ].map((feature) => (
              <div key={feature.title} className="group">
                <Card className="h-full bg-card/40 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6 space-y-3">
                    <div className={`w-11 h-11 rounded-xl ${feature.bg} border border-current/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center space-y-6 py-16 rounded-3xl bg-primary/5 border border-primary/10">
          <h2 className="text-3xl font-bold">准备好加入联邦宇宙了吗？</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            注册任意 Mastodon 实例，即可连接到整个去中心化社交网络。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <LoginModal>
              <Button size="lg" className="h-12 px-8 font-medium">
                <MessageCircle className="w-5 h-5 mr-2" />
                立即登录
              </Button>
            </LoginModal>
            <Button size="lg" variant="outline" onClick={handleGuestMode} className="h-12 px-8">
              <Globe className="w-5 h-5 mr-2" />
              访客浏览
            </Button>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-md flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-medium">MastoClient</span>
            </div>
            <p className="text-sm text-muted-foreground">Built with ❤️ for the fediverse community</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
