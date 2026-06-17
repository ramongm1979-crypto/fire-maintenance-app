"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaintenanceEvent } from "@/app/instalaciones/[id]/equipos/[assetId]/actions";
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

const EVENT_TYPE_LABEL: Record<string, string> = {
  revision: "Revisión",
  incidencia: "Incidencia",
  retimbrado: "Retimbrado",
  sustitucion: "Sustitución",
};

export function NewEventDialog({
  buildingId,
  assetId,
}: {
  buildingId: string;
  assetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await createMaintenanceEvent(buildingId, assetId, formData);
    setPending(false);
    if (!result?.error) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Registrar incidencia / revisión</Button>} />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo registro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo</Label>
              <Select name="event_type" defaultValue="revision">
                <SelectTrigger id="event_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician">Técnico</Label>
              <Input id="technician" name="technician" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="space-y-2 rounded-md border border-dashed p-3">
              <Label htmlFor="new_next_due_date">
                Actualizar próxima revisión (opcional)
              </Label>
              <Input id="new_next_due_date" name="new_next_due_date" type="date" />
              <p className="text-xs text-muted-foreground">
                Si rellenas esto, el equipo se quitará de los avisos hasta esa fecha.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photos">Fotos (opcional)</Label>
              <Input id="photos" name="photos" type="file" accept="image/*" multiple capture="environment" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
