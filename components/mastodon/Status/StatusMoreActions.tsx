"use client"

import { useMemo } from "react"
import { MoreHorizontal, Copy, Link2, ExternalLink, Trash2, BellOff, UserX, Globe, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { useStatusMoreActions } from "@/hooks/mastodon/useStatusMoreActions"
import { useTranslations } from "next-intl"
import type { mastodon } from "masto"

interface StatusMoreActionsProps {
  status: mastodon.v1.Status
}

export function StatusMoreActions({ status }: StatusMoreActionsProps) {
  const t = useTranslations("common")
  const {
    menuOpen,
    setMenuOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    loginOpen,
    setLoginOpen,
    isActionLoading,
    isOwnStatus,
    isAuthorSelf,
    authorDomain,
    postUrl,
    sourceUrl,
    copyPostLink,
    copySourceLink,
    openSource,
    deleteStatus,
    toggleMuteUser,
    toggleBlockUser,
    blockAuthorDomain,
    loadingAction,
  } = useStatusMoreActions({ status })

  const showDomainAction = useMemo(
    () => !!authorDomain && !isAuthorSelf,
    [authorDomain, isAuthorSelf],
  )

  return (
    <>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm rounded-xl bg-card border border-border/60 p-6 shadow-2xl shadow-black/10">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-lg font-semibold">{t("statusActions.deleteConfirmTitle")}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("statusActions.deleteConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              {t("statusActions.cancel")}
            </Button>
            <Button variant="destructive" onClick={deleteStatus} disabled={isActionLoading}>
              {t("statusActions.confirmDelete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("statusActions.moreActions")}
            className="inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/40 hover:text-primary-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-56 p-1 text-sm">
          <div className="space-y-1">
            <button
              type="button"
              onClick={copyPostLink}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
            >
              <Copy className="h-4 w-4" />
              {t("statusActions.copyLink")}
            </button>
            <button
              type="button"
              onClick={copySourceLink}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
            >
              <Link2 className="h-4 w-4" />
              {t("statusActions.copySourceLink")}
            </button>
            <button
              type="button"
              onClick={openSource}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {t("statusActions.openSource")}
            </button>
            {!isAuthorSelf && (
              <>
                <button
                  type="button"
                  onClick={toggleMuteUser}
                  disabled={isActionLoading}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors disabled:cursor-not-allowed"
                >
                  {loadingAction === "mute" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                  {t("statusActions.muteUser")}
                </button>
                <button
                  type="button"
                  onClick={toggleBlockUser}
                  disabled={isActionLoading}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors disabled:cursor-not-allowed"
                >
                  {loadingAction === "blockUser" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                  {t("statusActions.blockUser")}
                </button>
                {showDomainAction ? (
                  <button
                    type="button"
                    onClick={blockAuthorDomain}
                    disabled={isActionLoading}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-colors disabled:cursor-not-allowed"
                  >
                    {loadingAction === "blockDomain" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    {t("statusActions.blockDomain")}
                  </button>
                ) : null}
              </>
            )}
            {isOwnStatus ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setDeleteConfirmOpen(true)
                }}
                disabled={isActionLoading}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:cursor-not-allowed"
              >
                {loadingAction === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {t("statusActions.delete")}
              </button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
