"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomAttributesEditor({
  initial,
}: {
  initial?: Record<string, unknown>;
}) {
  const initialRows = Object.entries(initial ?? {})
    .filter(([key]) => key !== "observaciones")
    .map(([key, value]) => ({ key, value: String(value ?? "") }));

  const [rows, setRows] = useState(initialRows);

  function addRow() {
    setRows((r) => [...r, { key: "", value: "" }]);
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center justify-between">
        <Label>Otros parámetros</Label>
        <Button type="button" variant="ghost" size="sm" onClick={addRow}>
          <Plus className="size-4" />
          Añadir parámetro
        </Button>
      </div>
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin parámetros adicionales. Úsalo para datos que no encajen en los campos de arriba.
        </p>
      )}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              name="attr_key"
              placeholder="Nombre (ej. Eficacia)"
              defaultValue={row.key}
              className="w-1/3"
            />
            <Input name="attr_value" placeholder="Valor" defaultValue={row.value} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(i)}
              className="shrink-0 text-muted-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
