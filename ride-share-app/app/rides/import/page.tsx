import { getI18n } from "@/lib/i18n/server";
import { LocalizedPageHeading } from "@/components/localized-page-heading";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { aiImportPipelineEnabled } from "@/lib/ai/import-pipeline-config";

import { ImportRideForm } from "./import-ride-form";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t("import.title") };
}

export default async function ImportRidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/rides/import");
  const { data: cities } = await supabase.from("cities").select("id, name_en, name_mk");
  const pipelineEnabled = aiImportPipelineEnabled();

  return (
    <><main id="main-content" className="px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <LocalizedPageHeading title="import.title" intro="import.intro" introClassName="mt-3 max-w-2xl text-slate-600" />

        <div className="mt-8 surface-card p-5 sm:p-8">
          <ImportRideForm cities={cities ?? []} pipelineEnabled={pipelineEnabled} />
        </div>
      </div>
    </main></>
  );
}
