import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
} from "@/lib/asset-status";
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

  const { data: buildings } = (await supabase.from("buildings").select("*")) as {
    data: Building[] | null;
  };
  const buildingById = Object.fromEntries((buildings ?? []).map((b) => [b.id, b]));

  return (
    <>
      <NavBar userEmail={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold">Calendario de vencimientos</h1>

        <div className="mt-6 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Instalación</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(assets ?? []).map((asset) => {
                const dueState = getDueState(asset.next_due_date);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.next_due_date}</TableCell>
                    <TableCell>{buildingById[asset.building_id]?.name}</TableCell>
                    <TableCell>
                      <Link
                        href={`/instalaciones/${asset.building_id}/equipos/${asset.id}`}
                        className="hover:underline"
                      >
                        {ASSET_TYPE_LABEL[asset.type]} {asset.code ? `· ${asset.code}` : ""}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]}>
                        {DUE_STATE_LABEL[dueState]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(assets ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay vencimientos programados todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}
