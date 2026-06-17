import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { NewAssetDialog } from "@/components/assets/new-asset-dialog";
import { AssetsTable } from "@/components/assets/assets-table";
import { BuildingHeaderActions } from "@/components/buildings/building-header-actions";
import { ExportExcelButton } from "@/components/buildings/export-excel-button";
import { PrintButton } from "@/components/print-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Boxes, AlertTriangle, Clock4, CheckCircle2, X } from "lucide-react";
import {
  ASSET_TYPE_LABEL,
  ASSET_TYPE_ICON,
  ASSET_TYPE_COLOR,
  getDueState,
  type DueState,
} from "@/lib/asset-status";
import type { Asset, AssetType, Building } from "@/lib/types";

const ASSET_TYPES: AssetType[] = ["extintor", "bie", "detector", "central", "compuerta"];

const STATE_LABEL: Record<string, string> = {
  vencido: "Vencidos",
  aviso: "Próximos 30 días",
  ok: "Al día",
};

export default async function BuildingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ estado?: string }>;
}) {
  const { id } = await params;
  const { estado } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: building } = (await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .single()) as { data: Building | null };

  if (!building) notFound();

  const { data: assets } = (await supabase
    .from("assets")
    .select("*")
    .eq("building_id", id)
    .order("updated_at", { ascending: false })) as { data: Asset[] | null };

  const allAssets = assets ?? [];
  const assetsByType = ASSET_TYPES.reduce<Record<AssetType, Asset[]>>(
    (acc, type) => {
      acc[type] = allAssets.filter((a) => a.type === type);
      return acc;
    },
    {} as Record<AssetType, Asset[]>,
  );

  const dueStates = allAssets.map((a) => getDueState(a.next_due_date));
  const vencidos = dueStates.filter((s) => s === "vencido").length;
  const proximos = dueStates.filter((s) => s === "aviso").length;
  const alDia = dueStates.filter((s) => s === "ok").length;

  const stats = [
    {
      label: "Equipos totales",
      value: allAssets.length,
      icon: Boxes,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-950",
      href: `/instalaciones/${id}`,
    },
    {
      label: "Vencidos",
      value: vencidos,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
      href: `/instalaciones/${id}?estado=vencido`,
    },
    {
      label: "Próximos 30 días",
      value: proximos,
      icon: Clock4,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950",
      href: `/instalaciones/${id}?estado=aviso`,
    },
    {
      label: "Al día",
      value: alDia,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950",
      href: `/instalaciones/${id}?estado=ok`,
    },
  ];

  const filteredAssets =
    estado && estado in STATE_LABEL
      ? allAssets.filter((a) => getDueState(a.next_due_date) === (estado as DueState))
      : null;

  return (
    <AppShell userEmail={user?.email ?? ""}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{building.name}</h1>
          <p className="text-muted-foreground">{building.address}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <PrintButton />
          <ExportExcelButton building={building} assets={allAssets} />
          <BuildingHeaderActions building={building} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
        {stats.map((stat) => {
          const statEstado = stat.href.includes("estado=")
            ? stat.href.split("estado=")[1]
            : null;
          const isActive = estado ? estado === statEstado : statEstado === null;
          return (
          <Link key={stat.label} href={stat.href}>
            <Card
              className={`py-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isActive ? "ring-2 ring-destructive/50" : ""
              }`}
            >
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
          );
        })}
      </div>

      {filteredAssets ? (
        <div className="mt-8">
          <Card className="py-5">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {STATE_LABEL[estado!]} ({filteredAssets.length})
                </h2>
                <Link
                  href={`/instalaciones/${id}`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                  Quitar filtro
                </Link>
              </div>
              <AssetsTable assets={filteredAssets} buildingId={id} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="extintor" className="mt-8">
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/60 p-1.5 print:hidden">
            {ASSET_TYPES.map((type) => {
              const Icon = ASSET_TYPE_ICON[type];
              return (
                <TabsTrigger key={type} value={type} className="gap-1.5 py-1.5">
                  <Icon className="size-4" />
                  {ASSET_TYPE_LABEL[type]}
                  <span className="ml-0.5 rounded-full bg-foreground/10 px-1.5 text-xs">
                    {assetsByType[type].length}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {ASSET_TYPES.map((type) => {
            const Icon = ASSET_TYPE_ICON[type];
            return (
              <TabsContent key={type} value={type} className="mt-4">
                <Card className="py-5">
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${ASSET_TYPE_COLOR[type]}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <h2 className="text-xl font-semibold">{ASSET_TYPE_LABEL[type]}</h2>
                      </div>
                      <div className="print:hidden">
                        <NewAssetDialog buildingId={id} defaultType={type} />
                      </div>
                    </div>
                    <AssetsTable assets={assetsByType[type]} buildingId={id} />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </AppShell>
  );
}
