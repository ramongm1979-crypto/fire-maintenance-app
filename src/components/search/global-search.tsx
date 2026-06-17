"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ASSET_TYPE_ICON, ASSET_TYPE_LABEL } from "@/lib/asset-status";
import { Input } from "@/components/ui/input";

type AssetResult = {
  type: "asset";
  id: string;
  building_id: string;
  asset_type: string;
  code: string | null;
  location: string | null;
  brand: string | null;
  model: string | null;
  buildingName: string;
};

type BuildingResult = {
  type: "building";
  id: string;
  name: string;
  address: string | null;
};

type Result = AssetResult | BuildingResult;

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const like = `%${q}%`;

      const [assetsRes, buildingsRes] = await Promise.all([
        supabase
          .from("assets")
          .select("id, building_id, type, code, location, brand, model, buildings(name)")
          .or(
            `code.ilike.${like},location.ilike.${like},brand.ilike.${like},model.ilike.${like},serial_number.ilike.${like}`,
          )
          .limit(8),
        supabase
          .from("buildings")
          .select("id, name, address")
          .or(`name.ilike.${like},address.ilike.${like}`)
          .limit(5),
      ]);

      const assetResults: AssetResult[] = (assetsRes.data ?? []).map((a) => ({
        type: "asset",
        id: a.id,
        building_id: a.building_id,
        asset_type: a.type,
        code: a.code,
        location: a.location,
        brand: a.brand,
        model: a.model,
        buildingName:
          (a as unknown as { buildings: { name: string } | null }).buildings?.name ?? "",
      }));

      const buildingResults: BuildingResult[] = (buildingsRes.data ?? []).map((b) => ({
        type: "building",
        id: b.id,
        name: b.name,
        address: b.address,
      }));

      setResults([...buildingResults, ...assetResults]);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar por nombre, código, ubicación, marca..."
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-sm shadow-md">
          {results.length === 0 && !loading && (
            <p className="px-3 py-2 text-muted-foreground">Sin resultados.</p>
          )}
          {results.map((r) => {
            if (r.type === "building") {
              return (
                <Link
                  key={`b-${r.id}`}
                  href={`/instalaciones/${r.id}`}
                  className="flex items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <Building2 className="size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">Instalación · {r.address}</p>
                  </div>
                </Link>
              );
            }
            const Icon = ASSET_TYPE_ICON[r.asset_type] ?? Building2;
            return (
              <Link
                key={`a-${r.id}`}
                href={`/instalaciones/${r.building_id}/equipos/${r.id}`}
                className="flex items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <Icon className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {ASSET_TYPE_LABEL[r.asset_type] ?? r.asset_type} {r.code ? `· ${r.code}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.buildingName} · {r.location || [r.brand, r.model].filter(Boolean).join(" ")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
