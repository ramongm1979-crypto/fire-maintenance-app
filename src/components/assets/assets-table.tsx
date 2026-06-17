"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { NewAssetDialog } from "@/components/assets/new-asset-dialog";
import { TableSettingsDialog } from "@/components/assets/table-settings-dialog";
import { SortableTableHead, sortRows } from "@/components/sortable-table-head";
import { EmptyState } from "@/components/empty-state";
import { TableScrollTop } from "@/components/table-scroll-top";
import { PackageSearch } from "lucide-react";
import { deleteAsset } from "@/app/instalaciones/[id]/actions";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_ICON,
  ASSET_TYPE_COLOR,
} from "@/lib/asset-status";
import { loadAssetTablePrefs, getVisibleColumns, type AssetTablePrefs } from "@/lib/table-prefs";
import type { Asset } from "@/lib/types";

function cellValue(asset: Asset, key: string): string {
  switch (key) {
    case "location":
      return asset.location || "—";
    case "code":
      return asset.code || "—";
    case "brand":
      return [asset.brand, asset.model].filter(Boolean).join(" / ") || "—";
    case "serial_number":
      return asset.serial_number || "—";
    case "next_due_date":
      return asset.next_due_date || "—";
    case "status":
      return DUE_STATE_LABEL[getDueState(asset.next_due_date)];
    default:
      return asset.attributes?.[key] != null ? String(asset.attributes[key]) : "—";
  }
}

function sortValue(asset: Asset, key: string): string | number | null {
  switch (key) {
    case "location":
      return asset.location;
    case "code":
      return asset.code;
    case "brand":
      return [asset.brand, asset.model].filter(Boolean).join(" ");
    case "serial_number":
      return asset.serial_number;
    case "next_due_date":
      return asset.next_due_date;
    case "status":
      return getDueState(asset.next_due_date);
    default:
      return asset.attributes?.[key] != null ? String(asset.attributes[key]) : null;
  }
}

export function AssetsTable({ assets, buildingId }: { assets: Asset[]; buildingId: string }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [prefs, setPrefs] = useState<AssetTablePrefs | null>(null);

  useEffect(() => {
    setPrefs(loadAssetTablePrefs());
  }, []);

  const availableAttributeKeys = useMemo(() => {
    const keys = new Set<string>();
    assets.forEach((asset) => {
      Object.keys(asset.attributes ?? {}).forEach((k) => {
        if (k !== "observaciones") keys.add(k);
      });
    });
    return Array.from(keys).sort();
  }, [assets]);

  function handleSort(column: string) {
    if (sortKey === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column);
      setSortDir("asc");
    }
  }

  const activePrefs = prefs ?? loadAssetTablePrefs();
  const columns = getVisibleColumns(activePrefs, availableAttributeKeys);
  const sortedAssets = sortRows<Asset>(assets, sortKey, sortDir, sortValue);

  return (
    <div>
      <div className="mb-2 flex justify-end print:hidden">
        <TableSettingsDialog
          prefs={activePrefs}
          availableAttributeKeys={availableAttributeKeys}
          onChange={setPrefs}
        />
      </div>
      {assets.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No hay equipos de este tipo todavía"
          description="Añade el primero con el botón de arriba."
        />
      ) : (
        <TableScrollTop>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((col, i) => (
                  <SortableTableHead
                    key={col.key}
                    column={col.key}
                    label={col.label}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className={i === 0 ? "min-w-[200px]" : undefined}
                    style={
                      activePrefs.widths[col.key]
                        ? { width: activePrefs.widths[col.key] }
                        : undefined
                    }
                  />
                ))}
                <TableHead className="sticky right-0 z-10 w-0 bg-muted/50 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)] print:hidden" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssets.map((asset, rowIndex) => {
                const Icon = ASSET_TYPE_ICON[asset.type];
                const dueState = getDueState(asset.next_due_date);
                return (
                  <TableRow
                    key={asset.id}
                    className={rowIndex % 2 === 1 ? "bg-muted/20" : undefined}
                  >
                    {columns.map((col, i) => (
                      <TableCell
                        key={col.key}
                        style={
                          activePrefs.widths[col.key]
                            ? { width: activePrefs.widths[col.key] }
                            : undefined
                        }
                      >
                        {i === 0 ? (
                          <Link
                            href={`/instalaciones/${buildingId}/equipos/${asset.id}`}
                            className="group flex items-center gap-3"
                          >
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${ASSET_TYPE_COLOR[asset.type] ?? "bg-muted text-muted-foreground"}`}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="font-medium group-hover:underline">
                              {cellValue(asset, col.key)}
                            </span>
                          </Link>
                        ) : col.key === "status" ? (
                          <Badge
                            variant={DUE_STATE_BADGE_VARIANT[dueState]}
                            className="font-medium"
                          >
                            {cellValue(asset, col.key)}
                          </Badge>
                        ) : (
                          cellValue(asset, col.key)
                        )}
                      </TableCell>
                    ))}
                    <TableCell
                      className={`sticky right-0 z-10 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)] group-hover:bg-muted/50 print:hidden ${
                        rowIndex % 2 === 1 ? "bg-muted/20" : "bg-background"
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <NewAssetDialog
                          buildingId={buildingId}
                          asset={asset}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <DeleteConfirmButton
                          itemLabel={`el equipo "${asset.code || asset.type}"`}
                          onConfirm={() => deleteAsset(buildingId, asset.id)}
                        />
                      </div>
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
