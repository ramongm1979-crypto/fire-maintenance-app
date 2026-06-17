"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAsset } from "@/app/instalaciones/[id]/actions";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSET_TYPE_LABEL } from "@/lib/asset-status";

export function NewAssetDialog({
  buildingId,
  defaultType,
}: {
  buildingId: string;
  defaultType?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await createAsset(buildingId, formData);
    setPending(false);
    if (!result?.error) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Añadir equipo</Button>} />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo equipo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue={defaultType ?? "extintor"}>
                <SelectTrigger id="type" className="w-full">
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
              <Label htmlFor="code">Código</Label>
              <Input id="code" name="code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" name="location" placeholder="Planta, zona..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" name="model" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Nº de serie</Label>
              <Input id="serial_number" name="serial_number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="install_date">Fecha instalación</Label>
              <Input id="install_date" name="install_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Fecha caducidad</Label>
              <Input id="expiry_date" name="expiry_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_due_date">Próxima revisión</Label>
              <Input id="next_due_date" name="next_due_date" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
