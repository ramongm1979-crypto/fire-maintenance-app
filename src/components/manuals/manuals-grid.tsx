"use client";

import { useMemo, useState } from "react";
import { FileText, BookOpen, SearchX } from "lucide-react";
import { FilterInput } from "@/components/search/filter-input";
import { ManualActions } from "@/components/manuals/manual-actions";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABEL } from "@/lib/asset-status";
import type { Manual } from "@/lib/types";

export function ManualsGrid({ manuals }: { manuals: Manual[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return manuals;
    return manuals.filter((m) =>
      [m.title, m.brand, m.model, m.notes]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [manuals, query]);

  return (
    <>
      <div className="mt-4">
        <FilterInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar manual por título, marca o modelo..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={manuals.length === 0 ? BookOpen : SearchX}
            title={manuals.length === 0 ? "Todavía no hay manuales subidos" : "Sin resultados"}
            description={
              manuals.length === 0
                ? "Sube el primer manual técnico en PDF."
                : "Prueba con otro término de búsqueda."
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((manual) => (
            <Card key={manual.id} className="py-5 transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base leading-snug">{manual.title}</CardTitle>
                </div>
                <ManualActions manual={manual} />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {manual.asset_type && (
                    <Badge variant="outline">{ASSET_TYPE_LABEL[manual.asset_type]}</Badge>
                  )}
                  {manual.brand && <Badge variant="secondary">{manual.brand}</Badge>}
                </div>
                {manual.notes && (
                  <p className="whitespace-pre-wrap text-muted-foreground">{manual.notes}</p>
                )}
                <a
                  href={manual.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-medium text-primary hover:underline"
                >
                  Ver PDF
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
