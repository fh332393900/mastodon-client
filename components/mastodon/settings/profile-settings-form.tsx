"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaUploadField } from "@/components/mastodon/settings/media-upload"
import { useAccountSettings } from "@/hooks/mastodon/useAccountSettings"
import { cn } from "@/lib/utils"
import { Plus, Trash2, User, Image as ImageIcon, BadgeCheck } from "lucide-react"
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t("profile.title")}
          </CardTitle>
          <CardDescription>{t("profile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <MediaUploadField
              label={t("profile.avatarLabel")}
              description={t("profile.avatarDescription")}
              valueUrl={avatarUrl}
              resetKey={resetCounter}
              aspect={1}
              outputSize={{ width: 512, height: 512 }}
              onChange={(value) => setAvatar(value)}
              disabled={isSaving}
            />
            <MediaUploadField
              label={t("profile.headerLabel")}
              description={t("profile.headerDescription")}
              valueUrl={headerUrl}
              resetKey={resetCounter}
              aspect={3}
              outputSize={{ width: 1500, height: 500 }}
              previewWidth={360}
              onChange={(value) => setHeader(value)}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">{t("profile.displayNameLabel")}</Label>
              <Input
                id="display-name"
                value={form.displayName}
                onChange={(event) => setFieldValue("displayName", event.target.value)}
                disabled={isSaving}
              />
              {fieldErrors.displayName && (
                <p className="text-xs text-destructive">{fieldErrors.displayName.join(" ")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t("profile.usernameLabel")}</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(event) => setFieldValue("username", event.target.value)}
                disabled={isSaving}
              />
              {fieldErrors.username && (
                <p className="text-xs text-destructive">{fieldErrors.username.join(" ")}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t("profile.bioLabel")}</Label>
            <textarea
              id="bio"
              value={form.bio}
              onChange={(event) => setFieldValue("bio", event.target.value)}
              className={cn(
                "min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "placeholder:text-muted-foreground",
              )}
              disabled={isSaving}
            />
            {fieldErrors.bio && <p className="text-xs text-destructive">{fieldErrors.bio.join(" ")}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            {t("profile.fieldsTitle")}
          </CardTitle>
          <CardDescription>{t("profile.fieldsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor={`field-label-${field.id}`}>{t("profile.fieldLabel", { index: index + 1 })}</Label>
                <Input
                  id={`field-label-${field.id}`}
                  value={field.label}
                  onChange={(event) => setTagValue(field.id, "label", event.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`field-value-${field.id}`}>{t("profile.fieldValue")}</Label>
                <Input
                  id={`field-value-${field.id}`}
                  value={field.value}
                  onChange={(event) => setTagValue(field.id, "value", event.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(field.id)}
                  disabled={isSaving}
                  aria-label="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {fieldErrorMessage && <p className="text-xs text-destructive">{fieldErrorMessage}</p>}
          <Button type="button" variant="outline" size="sm" onClick={addField} disabled={!canAddField || isSaving}>
            <Plus className="h-4 w-4" />
            {t("profile.addField")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {t("profile.saveTitle")}
          </CardTitle>
          <CardDescription>{t("profile.saveDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {notice && <p className="text-sm text-primary">{notice}</p>}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => {
              resetForm()
              setResetCounter((prev) => prev + 1)
            }}
            variant="outline"
            disabled={isSaving}
          >
            {t("profile.reset")}
          </Button>
          <Button type="button" onClick={() => void save()} disabled={isSaving} className="ml-auto">
            {isSaving ? t("profile.saving") : t("profile.save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
