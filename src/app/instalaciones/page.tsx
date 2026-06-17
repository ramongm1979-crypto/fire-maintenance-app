import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { NewBuildingDialog } from "@/components/buildings/new-building-dialog";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Building } from "@/lib/types";

export default async function InstalacionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: buildings } = await supabase
    .from("buildings")
    .select("*")
    .order("name") as { data: Building[] | null };

  const { data: assetCounts } = await supabase
    .from("assets")
    .select("building_id");

  const countsByBuilding = (assetCounts ?? []).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.building_id] = (acc[row.building_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <>
      <NavBar userEmail={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Instalaciones</h1>
          <NewBuildingDialog />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(buildings ?? []).map((building) => (
            <Link key={building.id} href={`/instalaciones/${building.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{building.name}</CardTitle>
                  <CardDescription>
                    {building.address || "Sin dirección"}
                    <br />
                    {countsByBuilding[building.id] ?? 0} equipos
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {(buildings ?? []).length === 0 && (
            <p className="text-muted-foreground">
              Todavía no hay instalaciones. Crea la primera.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
