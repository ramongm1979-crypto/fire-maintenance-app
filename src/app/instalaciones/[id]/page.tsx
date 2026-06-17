import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { NewAssetDialog } from "@/components/assets/new-asset-dialog";
import { AssetsTable } from "@/components/assets/assets-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ASSET_TYPE_LABEL } from "@/lib/asset-status";
import type { Asset, AssetType, Building } from "@/lib/types";

const ASSET_TYPES: AssetType[] = ["extintor", "bie", "detector", "central", "compuerta"];

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    .order("code")) as { data: Asset[] | null };

  const assetsByType = ASSET_TYPES.reduce<Record<AssetType, Asset[]>>(
    (acc, type) => {
      acc[type] = (assets ?? []).filter((a) => a.type === type);
      return acc;
    },
    {} as Record<AssetType, Asset[]>,
  );

  return (
    <>
      <NavBar userEmail={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{building.name}</h1>
            <p className="text-muted-foreground">{building.address}</p>
          </div>
        </div>

        <Tabs defaultValue="extintor" className="mt-6">
          <div className="flex items-center justify-between">
            <TabsList>
              {ASSET_TYPES.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {ASSET_TYPE_LABEL[type]} ({assetsByType[type].length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {ASSET_TYPES.map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <div className="mb-4 flex justify-end">
                <NewAssetDialog buildingId={id} defaultType={type} />
              </div>
              <AssetsTable assets={assetsByType[type]} buildingId={id} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}
