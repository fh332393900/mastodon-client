"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/auth/login-modal"
import { MessageCircle, Users, Globe, Zap, Shield, Heart, ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { server } = useMasto()

  const handleGuestMode = () => {
    router.push(`/${server}/timeline`)
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">MastoClient</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Connect to the Fediverse</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Experience <span className="text-primary font-bold">Mastodon</span> Like Never Before
              </h1>

              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                A beautiful, modern client with a clean interface and fast access to your Mastodon timelines.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Zap, text: "Lightning Fast", color: "text-primary" },
                { icon: Shield, text: "Privacy First", color: "text-primary" },
                { icon: Heart, text: "Open Source", color: "text-secondary" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-card border rounded-full px-4 py-2 transition-transform duration-200 hover:scale-[1.02]">
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl transition-all duration-300">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to your account or explore as a guest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <LoginModal>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 text-primary-foreground">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </LoginModal>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleGuestMode}
                    className="w-full border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary transition-all duration-300 hover:scale-[1.02] bg-transparent"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Explore as Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose MastoClient?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Built for the modern web with attention to detail and user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Rich Timeline",
                description: "Clean timeline view with quick access to posts and replies.",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "Community Focus",
                description: "Follow conversations across the Fediverse with ease.",
                color: "text-secondary",
              },
              {
                icon: Zap,
                title: "Lightning Performance",
                description: "Fast load times and responsive navigation.",
                color: "text-primary",
              },
            ].map((feature, index) => (
              <div key={index} className="group">
                <Card className="h-full bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-md flex items-center justify-center">
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
