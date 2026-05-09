"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import type { MastoClient } from "@/components/auth/masto-provider"
import type { mastodon } from "masto"

export type CroppedImage = {
  file: File
  previewUrl: string
}

export type ProfileField = {
  id: string
  label: string
  value: string
}

export type ProfileFormState = {
  displayName: string
  username: string
  bio: string
  fields: ProfileField[]
}

type TranslateFn = (key: string, values?: Record<string, string | number>) => string

const buildProfileSchema = (t: TranslateFn) =>
  z
    .object({
      displayName: z.string().trim().max(30, t("validation.displayNameTooLong")),
      username: z.string().trim().optional(),
      bio: z.string().trim().max(500, t("validation.bioTooLong")),
      fields: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .max(4, t("validation.fieldsTooMany")),
    })
    .superRefine((data, ctx) => {
      data.fields.forEach((field, index) => {
        const label = field.label.trim()
        const value = field.value.trim()

        if (!label && !value) return
        if (!label || !value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.fieldPairRequired"),
            path: ["fields", index],
          })
          return
        }
        if (label.length > 30) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: 30,
            type: "string",
            inclusive: true,
            message: t("validation.labelTooLong"),
            path: ["fields", index, "label"],
          })
        }
        if (value.length > 255) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: 255,
            type: "string",
            inclusive: true,
            message: t("validation.valueTooLong"),
            path: ["fields", index, "value"],
          })
        }
      })
    })

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

type UpdateCredentialsParams = Parameters<MastoClient["v1"]["accounts"]["updateCredentials"]>[0]

const toFormState = (account: mastodon.v1.AccountCredentials): ProfileFormState => {
  const rawFields = account.source?.fields ?? account.fields ?? []
  const fields: ProfileField[] = rawFields.map((field, index) => ({
    id: `${account.id}-${index}`,
    label: field.name ?? "",
    value: field.value ?? "",
  }))

  return {
    displayName: account.displayName ?? "",
    username: account.username ?? account.acct ?? "",
    bio: account.note ?? "",
    fields: fields.length > 0 ? fields : [{ id: newId(), label: "", value: "" }],
  }
}

export function useAccountSettings() {
  const { client, isReady: isMastoReady, server } = useMasto()
  const { user, isInitialized, refreshUser } = useAuth()
  const t = useTranslations("settings")
  const queryClient = useQueryClient()

  const isReady = isMastoReady && isInitialized
  const queryKey = useMemo(() => ["account", "credentials", server] as const, [server])
  const profileSchema = useMemo(() => buildProfileSchema(t), [t])

  const credentialsQuery = useQuery<mastodon.v1.AccountCredentials>({
    queryKey,
    enabled: isReady && !!client,
    queryFn: async () => {
      if (!client) throw new Error("Mastodon client not ready")
      return client.v1.accounts.verifyCredentials()
    },
    initialData: user ?? undefined,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  const [form, setForm] = useState<ProfileFormState>(() => ({
    displayName: user?.displayName ?? "",
    username: user?.username ?? user?.acct ?? "",
    bio: user?.note ?? "",
    fields: [{ id: newId(), label: "", value: "" }],
  }))
  const [avatar, setAvatar] = useState<CroppedImage | null>(null)
  const [header, setHeader] = useState<CroppedImage | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string[]>>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!credentialsQuery.data || hydratedRef.current) return
    setForm(toFormState(credentialsQuery.data))
    hydratedRef.current = true
  }, [credentialsQuery.data])

  const setFieldValue = useCallback((key: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setTagValue = useCallback((id: string, key: "label" | "value", value: string) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => (field.id === id ? { ...field, [key]: value } : field)),
    }))
  }, [])

  const addField = useCallback(() => {
    setForm((prev) => {
      if (prev.fields.length >= 4) return prev
      return { ...prev, fields: [...prev.fields, { id: newId(), label: "", value: "" }] }
    })
  }, [])

  const removeField = useCallback((id: string) => {
    setForm((prev) => {
      const next = prev.fields.filter((field) => field.id !== id)
      return { ...prev, fields: next.length > 0 ? next : [{ id: newId(), label: "", value: "" }] }
    })
  }, [])

  const resetForm = useCallback(() => {
    if (!credentialsQuery.data) return
    setForm(toFormState(credentialsQuery.data))
    setAvatar(null)
    setHeader(null)
    setFormError(null)
    setFieldErrors({})
  }, [credentialsQuery.data])

  const mutation = useMutation({
    mutationFn: async (payload: UpdateCredentialsParams) => {
      if (!client) throw new Error("Mastodon client not ready")
      return client.v1.accounts.updateCredentials(payload)
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKey, data)
      await refreshUser()
      setForm(toFormState(data))
      setAvatar(null)
      setHeader(null)
      setNotice(t("validation.updated"))
      setFormError(null)
      setFieldErrors({})
    },
    onError: () => {
      setFormError(t("validation.updateFailed"))
    },
  })

  const save = useCallback(async () => {
    setNotice(null)
    setFormError(null)
    setFieldErrors({})

    const parsed = profileSchema.safeParse(form)
    if (!parsed.success) {
      setFormError(t("validation.fixErrors"))
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return false
    }

    const trimmedFields = parsed.data.fields
      .map((field) => ({
        label: field.label.trim(),
        value: field.value.trim(),
      }))
      .filter((field) => field.label && field.value)

    const fieldsAttributes = trimmedFields.map((field) => ({
      name: field.label,
      value: field.value,
    }))

    const payloadBase: UpdateCredentialsParams = {
      displayName: parsed.data.displayName.trim() || undefined,
      note: parsed.data.bio.trim() || undefined,
      fieldsAttributes: fieldsAttributes.length > 0 ? fieldsAttributes : undefined,
      avatar: avatar?.file,
      header: header?.file,
    }

    await mutation.mutateAsync(payloadBase)
    return true
  }, [avatar?.file, header?.file, form, mutation, credentialsQuery.data?.username])

  return {
    account: credentialsQuery.data ?? null,
    form,
    setFieldValue,
    setTagValue,
    addField,
    removeField,
    resetForm,
    setAvatar,
    setHeader,
    isReady,
    isLoading: credentialsQuery.isLoading,
    isSaving: mutation.isPending,
    formError,
    fieldErrors,
    notice,
  }
}
