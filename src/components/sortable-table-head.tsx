"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function SortableTableHead<T extends string>({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
  className,
  style,
}: {
  column: T;
  label: string;
  sortKey: T | null;
  sortDir: "asc" | "desc";
  onSort: (column: T) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isActive = sortKey === column;
  const Icon = isActive ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead className={className} style={style}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "flex items-center gap-1 hover:text-foreground",
          isActive && "text-foreground",
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </TableHead>
  );
}

export function sortRows<T>(
  rows: T[],
  sortKey: string | null,
  sortDir: "asc" | "desc",
  getValue: (row: T, key: string) => string | number | null,
) {
  if (!sortKey) return rows;
  const sorted = [...rows].sort((a, b) => {
    const va = getValue(a, sortKey);
    const vb = getValue(b, sortKey);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "number" && typeof vb === "number") return va - vb;
    return String(va).localeCompare(String(vb), "es", { sensitivity: "base" });
  });
  return sortDir === "asc" ? sorted : sorted.reverse();
}
