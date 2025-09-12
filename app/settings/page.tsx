"use client"

import { useState } from "react"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Server,
  Zap,
  Volume2,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function SettingsPage() {
  const [serverUrl, setServerUrl] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isConnected, setIsConnected] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    displayName: "",
    bio: "",
    animations: true,
    pushNotifications: true,
    emailNotifications: false,
    privateAccount: false,
    hideSensitive: true,
    autoplayMedia: true,
    reduceMotion: false,
    fontSize: [16],
    timelineRefresh: [30],
    language: "en",
    dateFormat: "relative",
  })

  const handleConnect = async () => {
    if (!serverUrl) return

    setIsConnecting(true)
    setConnectionStatus("idle")

    try {
      // Mock connection logic
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsConnected(true)
      setConnectionStatus("success")
    } catch (error) {
      setConnectionStatus("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectionStatus("idle")
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <ThreeColumnLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 border-b border-border pb-4"
        >
          <Settings className="w-8 h-8 text-gray-500" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </motion.div>

        <div className="grid gap-6">
          {/* Server Connection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-primary" />
                  <span>Server Connection</span>
                </CardTitle>
                <CardDescription>Connect to your Mastodon instance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected ? (
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Connected</p>
                        <p className="text-sm text-muted-foreground">{serverUrl}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="server-url">Mastodon Server URL</Label>
                      <Input
                        id="server-url"
                        type="url"
                        placeholder="https://mastodon.social"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                      />
                    </div>

                    {connectionStatus === "error" && (
                      <div className="flex items-center space-x-2 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Failed to connect to server</span>
                      </div>
                    )}

                    <Button onClick={handleConnect} disabled={!serverUrl || isConnecting} className="w-full">
                      {isConnecting ? "Connecting..." : "Connect to Server"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Account</span>
                </CardTitle>
                <CardDescription>Manage your account settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Your display name"
                    value={settings.displayName}
                    onChange={(e) => updateSetting("displayName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={settings.bio}
                    onChange={(e) => updateSetting("bio", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-secondary" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>Customize the look and feel of your client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable rich animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.animations}
                    onCheckedChange={(checked) => updateSetting("animations", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations for accessibility</p>
                  </div>
                  <Switch
                    checked={settings.reduceMotion}
                    onCheckedChange={(checked) => updateSetting("reduceMotion", checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <div className="px-3">
                    <Slider
                      value={settings.fontSize}
                      onValueChange={(value) => updateSetting("fontSize", value)}
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Small</span>
                      <span>{settings.fontSize[0]}px</span>
                      <span>Large</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-accent" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for mentions and replies</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get email updates for important activities</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Privacy & Performance</span>
                </CardTitle>
                <CardDescription>Control your privacy and performance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Private Account</Label>
                      <p className="text-sm text-muted-foreground">Require approval for new followers</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.privateAccount}
                    onCheckedChange={(checked) => updateSetting("privateAccount", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Hide Sensitive Content</Label>
                      <p className="text-sm text-muted-foreground">Automatically hide posts marked as sensitive</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.hideSensitive}
                    onCheckedChange={(checked) => updateSetting("hideSensitive", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Autoplay Media</Label>
                      <p className="text-sm text-muted-foreground">Automatically play videos and GIFs</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoplayMedia}
                    onCheckedChange={(checked) => updateSetting("autoplayMedia", checked)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <Label>Timeline Refresh Rate</Label>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={settings.timelineRefresh}
                      onValueChange={(value) => updateSetting("timelineRefresh", value)}
                      max={300}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10s</span>
                      <span>{settings.timelineRefresh[0]}s</span>
                      <span>5min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end space-x-4"
          >
            <Button variant="outline">Reset to Defaults</Button>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>
    </ThreeColumnLayout>
  )
}
