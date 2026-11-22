"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { useI18n } from "@/lib/i18n/provider";

export function SubmitButton({ children, pendingLabel, disabled, ...props }: ComponentProps<"button"> & { pendingLabel?: string }) {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return <button {...props} type="submit" disabled={disabled || pending} aria-disabled={disabled || pending}>{pending ? pendingLabel ?? t("common.saving") : children}</button>;
}
