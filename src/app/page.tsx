import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { GlobalSearch } from "@/components/search/global-search";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Boxes, AlertTriangle, Clock4, PartyPopper } from "lucide-react";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
  ASSET_TYPE_ICON,
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

  const { count: totalAssets } = await supabase
    .from("assets")
    .select("*", { count: "exact", head: true });

  const alerts = (assets ?? [])
    .map((asset) => ({ asset, dueState: getDueState(asset.next_due_date) }))
    .filter(({ dueState }) => dueState === "vencido" || dueState === "aviso");

  const vencidos = alerts.filter((a) => a.dueState === "vencido");
  const proximos = alerts.filter((a) => a.dueState === "aviso");

  const stats = [
    {
      label: "Instalaciones",
      value: (buildings ?? []).length,
      icon: Building2,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950",
      href: "/instalaciones",
    },
    {
      label: "Equipos totales",
      value: totalAssets ?? 0,
      icon: Boxes,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-950",
      href: "/instalaciones",
    },
    {
      label: "Vencidos",
      value: vencidos.length,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
      href: "#vencidos",
    },
    {
      label: "Próximos 30 días",
      value: proximos.length,
      icon: Clock4,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950",
      href: "#proximos",
    },
  ];

  return (
    <AppShell userEmail={user?.email ?? ""}>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="mt-4">
        <GlobalSearch />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="py-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-3">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <p className="text-3xl font-bold leading-none">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card id="vencidos" className="scroll-mt-6 py-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="size-4" />
              Vencidos ({vencidos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vencidos.length === 0 ? (
              <EmptyState icon={PartyPopper} title="Nada vencido" description="Todo al día." />
            ) : (
              vencidos.map(({ asset, dueState }) => (
                <AlertRow
                  key={asset.id}
                  asset={asset}
                  buildingName={buildingById[asset.building_id]?.name}
                  dueState={dueState}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card id="proximos" className="scroll-mt-6 py-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock4 className="size-4" />
              Próximos 30 días ({proximos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {proximos.length === 0 ? (
              <EmptyState
                icon={PartyPopper}
                title="Nada próximo a vencer"
                description="Sin revisiones pendientes en los próximos 30 días."
              />
            ) : (
              proximos.map(({ asset, dueState }) => (
                <AlertRow
                  key={asset.id}
                  asset={asset}
                  buildingName={buildingById[asset.building_id]?.name}
                  dueState={dueState}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
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
  const Icon = ASSET_TYPE_ICON[asset.type];
  return (
    <Link
      href={`/instalaciones/${asset.building_id}/equipos/${asset.id}`}
      className={`flex items-center justify-between gap-3 rounded-lg border-l-4 bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/60 ${
        dueState === "vencido" ? "border-l-destructive" : "border-l-amber-500"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="font-medium">
            {ASSET_TYPE_LABEL[asset.type]} {asset.code ? `· ${asset.code}` : ""}
          </p>
          <p className="text-muted-foreground">
            {buildingName} · {asset.next_due_date}
          </p>
        </div>
      </div>
      <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]}>{DUE_STATE_LABEL[dueState]}</Badge>
    </Link>
  );
}
