import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { NewAssetDialog } from "@/components/assets/new-asset-dialog";
import { CalendarViewSwitcher } from "@/components/calendar/calendar-view-switcher";
import type { Asset, Building } from "@/lib/types";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assets } = (await supabase
    .from("assets")
    .select("*")
    .not("next_due_date", "is", null)
    .order("next_due_date")) as { data: Asset[] | null };

  const { data: buildings } = (await supabase
    .from("buildings")
    .select("*")
    .order("name")) as {
    data: Building[] | null;
  };
  const buildingById = Object.fromEntries((buildings ?? []).map((b) => [b.id, b]));

  return (
    <AppShell userEmail={user?.email ?? ""}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendario de vencimientos</h1>
        {buildings && buildings.length > 0 && <NewAssetDialog buildings={buildings} />}
      </div>

      <div className="mt-6">
        <CalendarViewSwitcher assets={assets ?? []} buildingById={buildingById} />
      </div>
    </AppShell>
  );
}
