"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createAsset, updateAsset } from "@/app/instalaciones/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomAttributesEditor } from "@/components/custom-attributes-editor";
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
import type { Asset, Building } from "@/lib/types";

export function NewAssetDialog({
  buildingId,
  buildings,
  defaultType,
  asset,
  trigger,
}: {
  buildingId?: string;
  buildings?: Building[];
  defaultType?: string;
  asset?: Asset;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(asset);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const targetBuildingId =
      buildingId ?? asset?.building_id ?? (formData.get("building_id") as string);
    const result = isEdit
      ? await updateAsset(targetBuildingId, asset!.id, formData)
      : await createAsset(targetBuildingId, formData);
    setPending(false);
    if (!result?.error) {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus className="size-4" />
              Añadir equipo
            </Button>
          )
        }
      />
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar equipo" : "Nuevo equipo"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {buildings && !isEdit && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="building_id">Instalación</Label>
                <Select name="building_id" defaultValue={buildings[0]?.id}>
                  <SelectTrigger id="building_id" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue={asset?.type ?? defaultType ?? "extintor"}>
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
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                placeholder="Planta, zona..."
                defaultValue={asset?.location ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" name="code" defaultValue={asset?.code ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" defaultValue={asset?.brand ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" name="model" defaultValue={asset?.model ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_number">Nº de serie</Label>
              <Input
                id="serial_number"
                name="serial_number"
                defaultValue={asset?.serial_number ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="install_date">Fecha instalación</Label>
              <Input
                id="install_date"
                name="install_date"
                type="date"
                defaultValue={asset?.install_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Fecha caducidad</Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={asset?.expiry_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_due_date">Próxima revisión</Label>
              <Input
                id="next_due_date"
                name="next_due_date"
                type="date"
                defaultValue={asset?.next_due_date ?? ""}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                defaultValue={
                  asset?.attributes?.observaciones
                    ? String(asset.attributes.observaciones)
                    : ""
                }
              />
            </div>
            <CustomAttributesEditor initial={asset?.attributes} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
