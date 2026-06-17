"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarRowActions } from "@/components/calendar/calendar-row-actions";
import { FilterInput } from "@/components/search/filter-input";
import { EmptyState } from "@/components/empty-state";
import { TableScrollTop } from "@/components/table-scroll-top";
import { SortableTableHead, sortRows } from "@/components/sortable-table-head";
import { CalendarClock, SearchX } from "lucide-react";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
} from "@/lib/asset-status";
import type { Asset, Building } from "@/lib/types";

type SortColumn = "next_due_date" | "building" | "equipo" | "status";

export function CalendarTable({
  assets,
  buildingById,
}: {
  assets: Asset[];
  buildingById: Record<string, Building>;
}) {
  const [sortKey, setSortKey] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");

  function handleSort(column: SortColumn) {
    if (sortKey === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column);
      setSortDir("asc");
    }
  }

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((asset) =>
      [
        asset.code,
        asset.location,
        asset.brand,
        asset.model,
        asset.serial_number,
        buildingById[asset.building_id]?.name,
        ASSET_TYPE_LABEL[asset.type],
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [assets, query, buildingById]);

  const sortedAssets = sortRows<Asset>(filteredAssets, sortKey, sortDir, (asset, key) => {
    switch (key) {
      case "next_due_date":
        return asset.next_due_date;
      case "building":
        return buildingById[asset.building_id]?.name ?? null;
      case "equipo":
        return `${ASSET_TYPE_LABEL[asset.type]} ${asset.code ?? ""}`;
      case "status":
        return getDueState(asset.next_due_date);
      default:
        return null;
    }
  });

  return (
    <div>
      <div className="mb-4">
        <FilterInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por equipo, instalación, código..."
        />
      </div>
      {sortedAssets.length === 0 ? (
        <EmptyState
          icon={assets.length === 0 ? CalendarClock : SearchX}
          title={
            assets.length === 0
              ? "No hay vencimientos programados todavía"
              : "Sin resultados"
          }
          description={
            assets.length === 0
              ? "Los equipos con próxima revisión aparecerán aquí."
              : "Prueba con otro término de búsqueda."
          }
        />
      ) : (
        <TableScrollTop>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="next_due_date" label="Fecha" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTableHead column="building" label="Instalación" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTableHead column="equipo" label="Equipo" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableTableHead column="status" label="Estado" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <TableHead className="sticky right-0 z-10 w-0 bg-background shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssets.map((asset) => {
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
                    <TableCell className="sticky right-0 z-10 bg-background shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)] group-hover:bg-muted/50">
                      <CalendarRowActions asset={asset} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        </TableScrollTop>
      )}
    </div>
  );
}
