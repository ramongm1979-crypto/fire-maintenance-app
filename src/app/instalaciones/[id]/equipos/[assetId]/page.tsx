import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/nav-bar";
import { NewEventDialog } from "@/components/maintenance/new-event-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
} from "@/lib/asset-status";
import type { Asset, Building, Manual, MaintenanceEvent } from "@/lib/types";

const EVENT_TYPE_LABEL: Record<string, string> = {
  revision: "Revisión",
  incidencia: "Incidencia",
  retimbrado: "Retimbrado",
  sustitucion: "Sustitución",
};

export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string; assetId: string }>;
}) {
  const { id, assetId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: asset } = (await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .single()) as { data: Asset | null };

  if (!asset) notFound();

  const { data: building } = (await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .single()) as { data: Building | null };

  const { data: events } = (await supabase
    .from("maintenance_events")
    .select("*")
    .eq("asset_id", assetId)
    .order("event_date", { ascending: false })) as { data: MaintenanceEvent[] | null };

  let manualsQuery = supabase.from("manuals").select("*").eq("asset_type", asset.type);
  if (asset.brand) {
    manualsQuery = manualsQuery.ilike("brand", `%${asset.brand}%`);
  }
  const { data: manuals } = (await manualsQuery) as { data: Manual[] | null };

  const dueState = getDueState(asset.next_due_date);

  return (
    <>
      <NavBar userEmail={user?.email ?? ""} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Link
          href={`/instalaciones/${id}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {building?.name}
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {ASSET_TYPE_LABEL[asset.type]} {asset.code ? `· ${asset.code}` : ""}
            </h1>
            <p className="text-muted-foreground">{asset.location}</p>
          </div>
          <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]}>
            {DUE_STATE_LABEL[dueState]}
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Marca / Modelo: </span>
                {[asset.brand, asset.model].filter(Boolean).join(" / ") || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Nº de serie: </span>
                {asset.serial_number || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Fecha instalación: </span>
                {asset.install_date || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Fecha caducidad: </span>
                {asset.expiry_date || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Próxima revisión: </span>
                {asset.next_due_date || "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manuales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(manuals ?? []).length === 0 && (
                <p className="text-muted-foreground">No hay manuales vinculados.</p>
              )}
              {(manuals ?? []).map((manual) => (
                <a
                  key={manual.id}
                  href={manual.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline"
                >
                  {manual.title}
                </a>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Historial</h2>
            <NewEventDialog buildingId={id} assetId={assetId} />
          </div>
          <div className="mt-4 space-y-3">
            {(events ?? []).length === 0 && (
              <p className="text-muted-foreground">Sin registros todavía.</p>
            )}
            {(events ?? []).map((event) => (
              <Card key={event.id}>
                <CardContent className="py-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {EVENT_TYPE_LABEL[event.event_type]}
                    </span>
                    <span className="text-muted-foreground">{event.event_date}</span>
                  </div>
                  {event.description && <p className="mt-1">{event.description}</p>}
                  {event.technician && (
                    <p className="mt-1 text-muted-foreground">Técnico: {event.technician}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
