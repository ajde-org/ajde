"use client";
import { useI18n } from "@/lib/i18n/provider";
import { FormPageSkeleton } from "@/components/page-skeletons";

export default function ImportLoading() {
  const { t } = useI18n();
  return <FormPageSkeleton width="max-w-3xl" fields={2} backLink={false} title={t("import.title")} subtitle={t("import.intro")} />;
}
