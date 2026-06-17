import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { NewManualDialog } from "@/components/manuals/new-manual-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABEL } from "@/lib/asset-status";
import type { Manual } from "@/lib/types";

export default async function ManualesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: manuals } = (await supabase
    .from("manuals")
    .select("*")
    .order("title")) as { data: Manual[] | null };

  return (
    <>
      <NavBar userEmail={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Manuales</h1>
          <NewManualDialog />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(manuals ?? []).map((manual) => (
            <Card key={manual.id}>
              <CardHeader>
                <CardTitle className="text-base">{manual.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {manual.asset_type && (
                    <Badge variant="outline">{ASSET_TYPE_LABEL[manual.asset_type]}</Badge>
                  )}
                  {manual.brand && <Badge variant="secondary">{manual.brand}</Badge>}
                </div>
                <a
                  href={manual.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline"
                >
                  Ver PDF
                </a>
              </CardContent>
            </Card>
          ))}
          {(manuals ?? []).length === 0 && (
            <p className="text-muted-foreground">Todavía no hay manuales subidos.</p>
          )}
        </div>
      </main>
    </>
  );
}
