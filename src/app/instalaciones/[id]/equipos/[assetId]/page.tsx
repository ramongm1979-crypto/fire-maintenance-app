import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import Image from "next/image";
import { NewEventDialog } from "@/components/maintenance/new-event-dialog";
import { AssetHeaderActions } from "@/components/assets/asset-header-actions";
import { AssetPhotos } from "@/components/assets/asset-photos";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
  ASSET_TYPE_ICON,
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
  const Icon = ASSET_TYPE_ICON[asset.type];

  return (
    <AppShell userEmail={user?.email ?? ""}>
      <Link
        href={`/instalaciones/${id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {building?.name}
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {ASSET_TYPE_LABEL[asset.type]} {asset.code ? `· ${asset.code}` : ""}
            </h1>
            <p className="text-muted-foreground">{asset.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]}>
            {DUE_STATE_LABEL[dueState]}
          </Badge>
          <AssetHeaderActions buildingId={id} asset={asset} />
        </div>
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

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Observaciones y otros parámetros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {asset.attributes?.observaciones ? (
              <p className="whitespace-pre-wrap">{String(asset.attributes.observaciones)}</p>
            ) : (
              <p className="text-muted-foreground">Sin observaciones.</p>
            )}
            {Object.entries(asset.attributes ?? {}).filter(
              ([key]) => key !== "observaciones" && !key.startsWith("_"),
            ).length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t pt-3">
                {Object.entries(asset.attributes)
                  .filter(([key]) => key !== "observaciones" && !key.startsWith("_"))
                  .map(([key, value]) => (
                    <div key={key} className="contents">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd>{String(value ?? "—")}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetPhotos
              buildingId={id}
              assetId={assetId}
              photos={
                Array.isArray(asset.attributes?._photos)
                  ? (asset.attributes._photos as string[])
                  : []
              }
            />
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
                {event.attachments && event.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.attachments.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative size-16 overflow-hidden rounded-md border"
                      >
                        <Image src={url} alt="Foto del registro" fill sizes="64px" className="object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
