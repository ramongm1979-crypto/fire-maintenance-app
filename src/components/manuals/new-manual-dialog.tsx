"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { createManual, updateManual } from "@/app/manuales/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_TYPE_LABEL } from "@/lib/asset-status";
import type { Manual } from "@/lib/types";

export function NewManualDialog({
  manual,
  trigger,
}: {
  manual?: Manual;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = Boolean(manual);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = isEdit
      ? await updateManual(manual!.id, manual!.file_url, formData)
      : await createManual(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="size-4" />
              Subir manual
            </Button>
          )
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar manual" : "Nuevo manual"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required defaultValue={manual?.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" defaultValue={manual?.brand ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" defaultValue={manual?.model ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset_type">Tipo de equipo</Label>
              <Select name="asset_type" defaultValue={manual?.asset_type ?? "central"}>
                <SelectTrigger id="asset_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones</Label>
              <Textarea id="notes" name="notes" rows={3} defaultValue={manual?.notes ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">
                Archivo PDF {isEdit && "(déjalo vacío para mantener el actual)"}
              </Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept="application/pdf"
                required={!isEdit}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Subir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
