import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
} from "@/lib/asset-status";
import type { Asset, Building } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assets } = (await supabase
    .from("assets")
    .select("*")
    .not("next_due_date", "is", null)
    .order("next_due_date")) as { data: Asset[] | null };

  const { data: buildings } = (await supabase.from("buildings").select("*")) as {
    data: Building[] | null;
  };
  const buildingById = Object.fromEntries((buildings ?? []).map((b) => [b.id, b]));

  const alerts = (assets ?? [])
    .map((asset) => ({ asset, dueState: getDueState(asset.next_due_date) }))
    .filter(({ dueState }) => dueState === "vencido" || dueState === "aviso");

  const vencidos = alerts.filter((a) => a.dueState === "vencido");
  const proximos = alerts.filter((a) => a.dueState === "aviso");

  return (
    <>
      <NavBar userEmail={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">
                Vencidos ({vencidos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vencidos.length === 0 && (
                <p className="text-sm text-muted-foreground">Nada vencido. Bien.</p>
              )}
              {vencidos.map(({ asset, dueState }) => (
                <AlertRow
                  key={asset.id}
                  asset={asset}
                  buildingName={buildingById[asset.building_id]?.name}
                  dueState={dueState}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximos 30 días ({proximos.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proximos.length === 0 && (
                <p className="text-sm text-muted-foreground">Nada próximo a vencer.</p>
              )}
              {proximos.map(({ asset, dueState }) => (
                <AlertRow
                  key={asset.id}
                  asset={asset}
                  buildingName={buildingById[asset.building_id]?.name}
                  dueState={dueState}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function AlertRow({
  asset,
  buildingName,
  dueState,
}: {
  asset: Asset;
  buildingName?: string;
  dueState: "vencido" | "aviso" | "ok" | "sin_fecha";
}) {
  return (
    <Link
      href={`/instalaciones/${asset.building_id}/equipos/${asset.id}`}
      className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50"
    >
      <div>
        <p className="font-medium">
          {ASSET_TYPE_LABEL[asset.type]} {asset.code ? `· ${asset.code}` : ""}
        </p>
        <p className="text-muted-foreground">
          {buildingName} · {asset.next_due_date}
        </p>
      </div>
      <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]}>{DUE_STATE_LABEL[dueState]}</Badge>
    </Link>
  );
}
