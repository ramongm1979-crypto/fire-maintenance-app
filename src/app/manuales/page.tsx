import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { NewManualDialog } from "@/components/manuals/new-manual-dialog";
import { ManualsGrid } from "@/components/manuals/manuals-grid";
import type { Manual } from "@/lib/types";

export default async function ManualesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: manuals } = (await supabase
    .from("manuals")
    .select("*")
    .order("updated_at", { ascending: false })) as { data: Manual[] | null };

  return (
    <AppShell userEmail={user?.email ?? ""}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manuales</h1>
        <NewManualDialog />
      </div>

      <ManualsGrid manuals={manuals ?? []} />
    </AppShell>
  );
}
