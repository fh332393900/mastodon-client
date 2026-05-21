"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaUploadField } from "@/components/mastodon/settings/media-upload"
import { ComposeEditor } from "@/components/mastodon/compose-editor"
import { useAccountSettings } from "@/hooks/mastodon/useAccountSettings"
import { Plus, X, User, Image as ImageIcon, BadgeCheck } from "lucide-react"
import { useTranslations } from "next-intl"

export function ProfileSettingsForm() {
  const t = useTranslations("settings")
  const {
    account,
    form,
    setFieldValue,
    setTagValue,
    addField,
    removeField,
    resetForm,
    setAvatar,
    setHeader,
    isReady,
    isLoading,
    isSaving,
    save,
    formError,
    fieldErrors,
    notice,
  } = useAccountSettings()

  const avatarUrl = account?.avatar ?? null
  const headerUrl = account?.header ?? null
  const [resetCounter, setResetCounter] = useState(0)
  const [bioLength, setBioLength] = useState(0)

  const canAddField = form.fields.length < 4

  const fieldErrorMessage = useMemo(() => {
    if (!fieldErrors.fields) return null
    return fieldErrors.fields.filter(Boolean).join(" ")
  }, [fieldErrors.fields])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t("profile.loadingTitle")}
            </CardTitle>
            <CardDescription>{t("profile.loadingDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("profile.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("profile.description")}</p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="relative group">
              <MediaUploadField
                label={t("profile.headerLabel")}
                description={t("profile.headerDescription")}
                valueUrl={headerUrl}
                resetKey={resetCounter}
                aspect={3}
                outputSize={{ width: 1500, height: 500 }}
                onChange={(value) => setHeader(value)}
                disabled={isSaving}
                variant="overlay"
                showMeta={false}
                overlayPosition="center"
                frameClassName="rounded-none border-none h-48 sm:h-64"
                className="space-y-0"
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
              
              <div className="absolute -bottom-14 left-6 sm:left-10 z-10">
                <MediaUploadField
                  label={t("profile.avatarLabel")}
                  description={t("profile.avatarDescription")}
                  valueUrl={avatarUrl}
                  resetKey={resetCounter}
                  aspect={1}
                  outputSize={{ width: 512, height: 512 }}
                  onChange={(value) => setAvatar(value)}
                  disabled={isSaving}
                  variant="overlay"
                  showMeta={false}
                  overlayPosition="center"
                  previewWidth={120}
                  frameClassName="rounded-full border-4 border-background shadow-xl scale-100 group-hover:scale-105 transition-transform duration-300"
                  className="w-[120px] space-y-0"
                />
              </div>
            </div>

            <div className="pt-20 pb-8 px-6 sm:px-10 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="display-name" className="text-sm font-bold ml-1">{t("profile.displayNameLabel")}</Label>
                  <Input
                    id="display-name"
                    value={form.displayName}
                    onChange={(event) => setFieldValue("displayName", event.target.value)}
                    disabled={isSaving}
                    placeholder="Enter your name"
                    className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                  />
                  {fieldErrors.displayName && (
                    <p className="text-xs font-medium text-destructive mt-1.5 ml-1">{fieldErrors.displayName.join(" ")}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="bio" className="text-sm font-bold">{t("profile.bioLabel")}</Label>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{bioLength}/500</span>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/30 focus-within:bg-background transition-all overflow-hidden">
                  <ComposeEditor
                    value={form.bio}
                    onChange={(v) => setFieldValue("bio", v)}
                    placeholder={t("profile.bioPlaceholder")}
                    className="min-h-[140px] p-4"
                    onLengthChange={(n) => setBioLength(n)}
                  />
                </div>
                {fieldErrors.bio && <p className="text-xs font-medium text-destructive mt-1.5 ml-1">{fieldErrors.bio.join(" ")}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("profile.fieldsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("profile.fieldsDescription")}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {form.fields.map((field, index) => (
            <div key={field.id} className="group relative rounded-2xl border border-border/50 bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">
                  {t("profile.fieldLabel", { index: index + 1 })}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                  disabled={isSaving}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground/80 ml-1">{t("profile.fieldLabelInput")}</Label>
                  <Input
                    value={field.label}
                    onChange={(event) => setTagValue(field.id, "label", event.target.value)}
                    disabled={isSaving}
                    className="h-10 rounded-xl bg-muted/30 border-border/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground/80 ml-1">{t("profile.fieldValue")}</Label>
                  <Input
                    value={field.value}
                    onChange={(event) => setTagValue(field.id, "value", event.target.value)}
                    disabled={isSaving}
                    className="h-10 rounded-xl bg-muted/30 border-border/40"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            onClick={addField} 
            disabled={!canAddField || isSaving}
            className="h-12 border-dashed border-2 rounded-2xl hover:bg-primary/5 hover:border-primary/50 transition-all group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
            {t("profile.addField")}
          </Button>
        </div>
      </section>

      <div className="sticky bottom-6 z-20 flex flex-col gap-3 p-4 bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl shadow-xl">
        {formError && (
          <div className="px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive animate-in fade-in slide-in-from-bottom-2">
            {formError}
          </div>
        )}
        {notice && (
          <div className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-in fade-in slide-in-from-bottom-2">
            {notice}
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              resetForm()
              setResetCounter((prev) => prev + 1)
            }}
            variant="ghost"
            disabled={isSaving}
            className="flex-1 rounded-xl h-11"
          >
            {t("profile.reset")}
          </Button>
          <Button 
            type="button" 
            onClick={() => void save()} 
            disabled={isSaving} 
            className="flex-[2] rounded-xl h-11 shadow-lg shadow-primary/20 font-bold"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                {t("profile.saving")}
              </span>
            ) : t("profile.save")}
          </Button>
        </div>
      </div>
    </div>
  )
}
