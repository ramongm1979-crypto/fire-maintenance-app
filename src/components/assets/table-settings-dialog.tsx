"use client";

import { useState } from "react";
import { Settings2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FIXED_COLUMN_KEYS,
  getVisibleColumns,
  type AssetTablePrefs,
  saveAssetTablePrefs,
} from "@/lib/table-prefs";

export function TableSettingsDialog({
  prefs,
  availableAttributeKeys,
  onChange,
}: {
  prefs: AssetTablePrefs;
  availableAttributeKeys: string[];
  onChange: (prefs: AssetTablePrefs) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(prefs);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(prefs);
    setOpen(next);
  }

  const visibleColumns = getVisibleColumns(draft, availableAttributeKeys);
  const inactiveExtraKeys = availableAttributeKeys.filter(
    (k) => !draft.extraAttributeKeys.includes(k),
  );

  function moveColumn(index: number, dir: -1 | 1) {
    const order = visibleColumns.map((c) => c.key);
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setDraft((d) => ({ ...d, order }));
  }

  function renameColumn(key: string, label: string) {
    setDraft((d) => ({ ...d, labels: { ...d.labels, [key]: label } }));
  }

  function setWidth(key: string, width: string) {
    const num = Number(width);
    setDraft((d) => ({
      ...d,
      widths: { ...d.widths, [key]: Number.isFinite(num) && num > 0 ? num : 0 },
    }));
  }

  function addExtraColumn(key: string) {
    setDraft((d) => ({
      ...d,
      extraAttributeKeys: [...d.extraAttributeKeys, key],
      order: [...d.order, key],
    }));
  }

  function removeExtraColumn(key: string) {
    setDraft((d) => ({
      ...d,
      extraAttributeKeys: d.extraAttributeKeys.filter((k) => k !== key),
    }));
  }

  function handleSave() {
    saveAssetTablePrefs(draft);
    onChange(draft);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon">
            <Settings2 className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Columnas de la tabla</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_72px_56px] gap-2 px-1 text-xs font-medium text-muted-foreground">
              <span>Nombre</span>
              <span>Ancho (px)</span>
              <span>Orden</span>
            </div>
            {visibleColumns.map((col, i) => (
              <div key={col.key} className="grid grid-cols-[1fr_72px_56px] items-center gap-2">
                <Input
                  value={col.label}
                  onChange={(e) => renameColumn(col.key, e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="auto"
                  value={draft.widths[col.key] || ""}
                  onChange={(e) => setWidth(col.key, e.target.value)}
                />
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === 0}
                    onClick={() => moveColumn(i, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={i === visibleColumns.length - 1}
                    onClick={() => moveColumn(i, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  {!FIXED_COLUMN_KEYS.includes(col.key as never) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeExtraColumn(col.key)}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {inactiveExtraKeys.length > 0 && (
            <div>
              <Label className="mb-2 block">Añadir columna de parámetro</Label>
              <div className="flex flex-wrap gap-2">
                {inactiveExtraKeys.map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addExtraColumn(key)}
                  >
                    + {key}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
