"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/auth/login-modal"
import {
  MessageCircle,
  Globe,
  Zap,
  Shield,
  Heart,
  ArrowRight,
  Github,
  Lock,
  Rss,
  Users,
} from "lucide-react"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { useTranslations } from "next-intl"
import { CarbonBadge } from "@/components/carbon-badge"

export default function HomePage() {
  const router = useRouter()
  const { server, accessToken } = useMasto()
  const { isAuthenticated } = useAuth()
  const t = useTranslations("home")

  useEffect(() => {
    if (accessToken) {
      // router.replace(`/${server}/timeline`)
    }
  }, [accessToken, router, server])

  const handleGuestMode = () => {
    router.push(`/${server}/timeline`)
  }

  const handleEnter = () => {
    if (isAuthenticated) {
      router.push(`/${server}/timeline`)
    }
  }

  // if (accessToken) return null

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0f] text-foreground antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-[#f5f5f7]/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <img
            src="/icon.svg"
            alt="MastoClient"
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-2xl font-bold text-foreground font-['Quicksand']">MastoClient</span>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 pt-4 lg:pt-6 xl:pt-10 2xl:pt-24">
          {/* background orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-[500px] w-[700px] rounded-full bg-gradient-to-b from-violet-400/15 via-indigo-400/8 to-transparent blur-3xl dark:from-violet-600/12 dark:via-indigo-600/6" />
          </div>

          <div className="mx-auto max-w-6xl pb-16 grid md:grid-cols-2 gap-12 items-center">
            {/* ── Left: text ── */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-500/60 bg-violet-50 dark:bg-primary/20 px-4 py-1.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                {t("hero.badge")}
              </div>

              <h1 className="text-4xl font-['Quicksand'] md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                <span>{t.rich("hero.title", { br: () => <br /> })}</span>
                <span className="bg-gradient-to-r ml-2 from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-wrap gap-3">
                {accessToken ? (
                  <Button
                    size="lg"
                    onClick={handleEnter}
                    className="h-11 px-7 rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {t("hero.cta.timeline")}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <LoginModal>
                    <Button
                      size="lg"
                      className="h-11 px-7 rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02]"
                    >
                      {t("hero.cta.getStarted")}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </LoginModal>
                )}
                {!accessToken && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleGuestMode}
                  className="h-11 px-7 rounded-full font-medium transition-all duration-200"
                >
                  <Globe className="w-4 h-4 mr-1.5" />
                  {t("hero.cta.guest")}
                </Button>
                )}
              </div>

              {/* stats */}
              <div className="flex gap-8 pt-1">
                {[
                  { value: "10M+", label: t("hero.stats.activeUsers") },
                  { value: "10K+", label: t("hero.stats.instances") },
                  { value: "100%", label: t("hero.stats.adFree") },
                ].map((s, i) => (
                  <div key={s.label} className={`text-left ${i > 0 ? "pl-8 border-l border-border/50" : ""}`}>
                    <div className="text-xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: App preview ── */}
            <div className="relative" style={{ perspective: "1200px" }}>
              {/* glow */}
              <div className="absolute -inset-4 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />
              <div
                className="relative rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 bg-white dark:bg-[#111116]"
                style={{
                  transform: "rotateY(-22deg) rotateX(6deg) scale(1.1)",
                  transformOrigin: "right center",
                  boxShadow: "8px 16px 48px -8px rgba(109,40,217,0.22), 24px 32px 80px -16px rgba(0,0,0,0.18)",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = "rotateY(-16deg) rotateX(1deg) scale(1.1)"
                  el.style.boxShadow = "4px 8px 32px -4px rgba(109,40,217,0.18), 12px 20px 48px -8px rgba(0,0,0,0.12)"
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = "rotateY(-22deg) rotateX(3deg) scale(1.1)"
                  el.style.boxShadow = "8px 16px 48px -8px rgba(109,40,217,0.22), 24px 32px 80px -16px rgba(0,0,0,0.18)"
                }}
              >
                {/* titlebar */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f0f0f5] dark:bg-[#1a1a22] border-b border-black/5 dark:border-white/5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-[10px] text-muted-foreground/50 font-mono">{t("preview.windowUrl")}</span>
                </div>

                {/* body */}
                <div className="flex text-[11px]">
                  {/* sidebar */}
                  <div className="hidden sm:flex flex-col justify-between py-5 px-4 border-r border-black/5 dark:border-white/5 min-w-[130px] bg-[#fafafa] dark:bg-[#0f0f14]">
                    {/* logo */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-5 px-1">
                        <img
                          src="/icon.svg"
                          alt="MastoClient"
                          className="h-6 w-6 rounded-lg"
                        />
                        <span className="text-[11px] font-['Quicksand']">MastoClient</span>
                      </div>
                      <div className="space-y-0.5">
                        {[
                          { label: t("preview.sidebar.home"), icon: "🏠", active: false },
                          { label: t("preview.sidebar.favorites"), icon: "🤍", active: false },
                          { label: t("preview.sidebar.compose"), icon: "✏️", active: false },
                          { label: t("preview.sidebar.explore"), icon: "🔍", active: false },
                          { label: t("preview.sidebar.settings"), icon: "⚙️", active: false },
                        ].map((item, i) => (
                          <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i === 0 ? "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-medium" : "text-muted-foreground/60"}`}>
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* footer hint */}
                    <div className="px-1 space-y-2">
                      <div className="text-[9px] text-muted-foreground/40 leading-relaxed">
                        {t.rich("preview.sidebar.viewing", {
                          server: () => <span className="font-semibold">{'m.webtoo.ls'}</span>,
                        })}
                      </div>
                      <div className="w-full rounded-lg bg-violet-600 text-white text-center py-1 text-[10px] font-medium cursor-pointer">{t("preview.sidebar.signIn")}</div>
                    </div>
                  </div>

                  {/* main */}
                  <div className="flex-1 min-w-0">
                    {/* profile header image */}
                    {/* <div className="h-16 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 relative">
                      <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
                    </div> */}

                    <div className="px-4 py-3">
                      {/* avatar + follow row */}

                      {/* name */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[13px] text-foreground">{t("preview.profile.name")}</div>
                          <div className="text-muted-foreground/60 text-[10px] mb-2">{t("preview.profile.handle")}</div>
                        </div>
                        <div className="mb-1 px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-medium">{t("preview.profile.follow")}</div>
                      </div>
                      

                      {/* bio */}
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                        {t.rich("preview.profile.bio", {
                          tag: (chunks) => <span className="text-violet-500">{chunks}</span>,
                        })}
                      </p>

                      {/* tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {["#solidarityeconomy", "#postgrowth", "#postcapitalism"].map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-[9px]">{t}</span>
                        ))}
                      </div>

                      {/* meta grid */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3 rounded-xl bg-muted/30 p-2.5 text-[9px]">
                        <div>
                          <div className="text-muted-foreground/50 uppercase tracking-wide mb-0.5">{t("preview.profile.meta.website")}</div>
                          <div className="text-violet-500 truncate">linktr.ee/postgrowthinstitute</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 uppercase tracking-wide mb-0.5">{t("preview.profile.meta.bluesky")}</div>
                          <div className="text-violet-500 truncate">bsky.app/profile/…</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 uppercase tracking-wide mb-0.5">{t("preview.profile.meta.instagram")}</div>
                          <div className="text-violet-500 truncate">instagram.com/postgrowth/</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 uppercase tracking-wide mb-0.5">{t("preview.profile.meta.organization")}</div>
                          <div className="text-foreground/70">{t("preview.profile.meta.organizationValue")}</div>
                        </div>
                      </div>

                      {/* join date */}
                      <div className="flex items-center gap-3 text-[9px] text-muted-foreground/50 mb-3">
                        <span>{t("preview.profile.joined")}</span>
                        <span>{t("preview.profile.lastActive")}</span>
                      </div>

                      {/* stats bar */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="font-bold text-foreground">266</span><span className="text-muted-foreground/60 mr-2">{t("preview.profile.stats.posts")}</span>
                        <span className="font-bold text-foreground">35</span><span className="text-muted-foreground/60 mr-2">{t("preview.profile.stats.following")}</span>
                        <span className="font-bold text-foreground">1,159</span><span className="text-muted-foreground/60">{t("preview.profile.stats.followers")}</span>
                      </div>
                    </div>
                  </div>

                  {/* right panel */}
                  <div className="hidden lg:flex flex-col gap-3 p-3 min-w-[110px] border-l border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#0f0f14]">
                    {/* search */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1.5">
                      <span className="text-muted-foreground/40 text-[9px]">🔍</span>
                      <span className="text-[9px] text-muted-foreground/40">{t("preview.right.search")}</span>
                    </div>
                    {/* trending */}
                    <div>
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-foreground mb-2">
                        <span className="text-orange-400">#</span> {t("preview.right.trending")}
                      </div>
                      {[
                        { tag: "#introduction", sub: t("preview.right.trends.introduction") },
                        { tag: "#cats", sub: t("preview.right.trends.cats") },
                        { tag: "#rustlang", sub: t("preview.right.trends.rustlang") },
                      ].map((t) => (
                        <div key={t.tag} className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-[9px] font-medium text-violet-600 dark:text-violet-400">{t.tag}</div>
                            <div className="text-[8px] text-muted-foreground/50">{t.sub}</div>
                          </div>
                          {/* mini sparkline */}
                          <svg width="32" height="12" viewBox="0 0 32 12" className="text-violet-400 opacity-60">
                            <polyline points="0,10 8,4 16,8 24,2 32,6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ))}
                      <div className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5 cursor-pointer hover:text-primary transition-colors">
                        {t("preview.right.viewMore")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento feature grid ── */}
        <section className="mx-auto max-w-5xl px-6 pt-18 pb-8">
          <div className="text-center space-y-3 mb-14 font-['Quicksand']">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t("bento.title.main")}
              <span className="text-muted-foreground font-normal"> {t("bento.title.sub")}</span>
            </h2>
            <p className="text-muted-foreground text-[15px]">{t("bento.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card - One account */}
            <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3" />
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-3">{t("bento.connect.tag")}</p>
              <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-3 font-['Quicksand']">
                {t.rich("bento.connect.title", { br: () => <br /> })}
              </h3>
              <p className="text-sm text-violet-100/80 max-w-xs leading-relaxed">
                {t("bento.connect.desc")}
              </p>
            </div>

            {/* Your timeline */}
            <div className="rounded-3xl bg-white dark:bg-[#111116] border border-black/6 dark:border-white/6 p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
                <Rss className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-snug mb-1.5 font-['Quicksand']">{t.rich("bento.timeline.title", { br: () => <br /> })}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("bento.timeline.desc")}</p>
              </div>
              <div className="space-y-1.5 pt-1">
                {[t("bento.timeline.items.home"), t("bento.timeline.items.favorites"), t("bento.timeline.items.compose"), t("bento.timeline.items.explore")].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="rounded-3xl bg-white dark:bg-[#111116] border border-black/6 dark:border-white/6 p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1.5 font-['Quicksand']">{t("bento.privacy.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("bento.privacy.desc")}</p>
              </div>
            </div>

            {/* Open source */}
            <div className="rounded-3xl bg-[#0d1117] dark:bg-[#0d1117] p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1.5 text-white font-['Quicksand']">{t.rich("bento.opensource.title", { br: () => <br /> })}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{t("bento.opensource.desc")}</p>
              </div>
            </div>

            {/* Available everywhere */}
            <div className="rounded-3xl bg-white dark:bg-[#111116] border border-black/6 dark:border-white/6 p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1.5 font-['Quicksand']">{t("bento.everywhere.title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("bento.everywhere.desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature list (4 points) ── */}
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {[
              { icon: Users, title: t("features.decentralized.title"), desc: t("features.decentralized.desc") },
              { icon: Github, title: t("features.opensource.title"), desc: t("features.opensource.desc") },
              { icon: Rss, title: t("features.chronological.title"), desc: t("features.chronological.desc") },
              { icon: Shield, title: t("features.privacy.title"), desc: t("features.privacy.desc") },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-foreground/5 dark:bg-foreground/8 border border-foreground/8 flex items-center justify-center">
                  <item.icon className="w-4.5 h-4.5 text-foreground/70" />
                </div>
                <div>
                  <div className="font-semibold text-[15px] mb-1 font-['Quicksand']">{item.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-12 text-center text-white shadow-2xl shadow-violet-500/25">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-['Quicksand']">{t("cta.title")}</h2>
              <p className="text-violet-100/80 max-w-md mx-auto text-[15px] leading-relaxed">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={handleEnter}
                    className="h-12 px-8 rounded-full font-medium bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t("cta.timeline")}
                  </Button>
                ) : (
                  <LoginModal>
                    <Button size="lg" className="h-12 px-8 rounded-full font-medium bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t("cta.signIn")}
                    </Button>
                  </LoginModal>
                )}
                {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleGuestMode}
                  className="h-12 px-8 rounded-full font-medium border-white/30 text-white bg-transparent dark:hover:text-white"
                >
                  {t("cta.guest")}
                </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 dark:border-white/5 bg-[#f0f0f5]/60 dark:bg-[#060608]/60">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.svg"
              alt="MastoClient"
              className="h-7 w-7 rounded-lg"
            />
            <span className="text-xl font-bold text-foreground font-['Quicksand']">MastoClient</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("footer.tagline")}{" "}
            <span className="text-primary">{t("footer.taglineHighlight")}</span>
          </p>
          
          <p className="text-xs text-muted-foreground">{t.rich("footer.builtWith", { heart: () => <Heart className="inline w-3 h-3 text-red-400" /> })}</p>
        </div>
        <div className="flex justify-center pb-4">
          <CarbonBadge />
        </div>
      </footer>

    </div>
  )
}

