"use client"

import { useState } from "react"
import { AboutPanel } from "@/components/mastodon/settings/about-panel"
import { AppearancePanel } from "@/components/mastodon/settings/appearance-panel"
import { PreferencesPanel } from "@/components/mastodon/settings/preferences-panel"
import { ProfileSettingsForm } from "@/components/mastodon/settings/profile-settings-form"
import { SettingsShell, type SettingsSection } from "@/components/mastodon/settings/settings-shell"

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("profile")

  return (
    <SettingsShell section={section} onSectionChange={setSection}>
      {section === "profile" && <ProfileSettingsForm />}
      {section === "preferences" && <PreferencesPanel />}
      {section === "appearance" && <AppearancePanel />}
      {section === "about" && <AboutPanel />}
    </SettingsShell>
  )
}
