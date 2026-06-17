import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { BuildingDialog } from "@/components/buildings/building-dialog";
import { BuildingActions } from "@/components/buildings/building-actions";
import { GlobalSearch } from "@/components/search/global-search";
import { EmptyState } from "@/components/empty-state";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { getDueState } from "@/lib/asset-status";
import type { Asset, Building } from "@/lib/types";

export default async function InstalacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: buildings } = await supabase
    .from("buildings")
    .select("*")
    .order("updated_at", { ascending: false }) as { data: Building[] | null };

  const { data: assets } = (await supabase
    .from("assets")
    .select("building_id, next_due_date")) as { data: Pick<Asset, "building_id" | "next_due_date">[] | null };

  const statsByBuilding = (assets ?? []).reduce<
    Record<string, { total: number; vencidos: number }>
  >((acc, row) => {
    const entry = acc[row.building_id] ?? { total: 0, vencidos: 0 };
    entry.total += 1;
    if (getDueState(row.next_due_date) === "vencido") entry.vencidos += 1;
    acc[row.building_id] = entry;
    return acc;
  }, {});

  return (
    <AppShell userEmail={user?.email ?? ""}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instalaciones</h1>
          <p className="text-muted-foreground">
            {(buildings ?? []).length} instalaciones registradas
          </p>
        </div>
        <BuildingDialog />
      </div>

      <div className="mt-4">
        <GlobalSearch />
      </div>

      {(buildings ?? []).length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Building2}
            title="Todavía no hay instalaciones"
            description="Crea la primera para empezar a gestionar su mantenimiento."
            action={<BuildingDialog />}
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(buildings ?? []).map((building) => {
            const stats = statsByBuilding[building.id] ?? { total: 0, vencidos: 0 };
            return (
              <Link key={building.id} href={`/instalaciones/${building.id}`} className="block">
                <Card className="h-full gap-3 py-5 transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:shadow-md">
                  <CardHeader className="flex-row items-start justify-between space-y-0">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{building.name}</CardTitle>
                        <CardDescription>{building.address || "Sin dirección"}</CardDescription>
                      </div>
                    </div>
                    <BuildingActions building={building} />
                  </CardHeader>
                  <div className="flex flex-wrap gap-2 px-6">
                    <Badge variant="secondary">{stats.total} equipos</Badge>
                    {stats.vencidos > 0 && (
                      <Badge variant="destructive">{stats.vencidos} vencidos</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
