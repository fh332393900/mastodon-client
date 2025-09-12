"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/auth/login-modal"
import { MessageCircle, Users, Globe, Zap, Shield, Heart, ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleGuestMode = () => {
    // Navigate to timeline in guest mode
    window.location.href = "/timeline?mode=guest"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">MastoClient</span>
        </motion.div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Connect to the Fediverse</span>
              </motion.div>

              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                Experience <span className="text-primary font-bold">Mastodon</span> Like Never Before
              </h1>

              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                A beautiful, modern client with rich animations and premium dark theme. Connect with your community
                across the decentralized social web.
              </p>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Zap, text: "Lightning Fast", color: "text-primary" },
                { icon: Shield, text: "Privacy First", color: "text-primary" },
                { icon: Heart, text: "Open Source", color: "text-secondary" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-card border rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200"
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
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
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-24 space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose MastoClient?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Built for the modern web with attention to detail and user experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Rich Timeline",
                description: "Beautiful, animated timeline with smooth scrolling and rich media support",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "Community Focus",
                description: "Discover and connect with communities across the fediverse",
                color: "text-secondary",
              },
              {
                icon: Zap,
                title: "Lightning Performance",
                description: "Optimized for speed with intelligent caching and preloading",
                color: "text-primary",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="h-full bg-card/30 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
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
