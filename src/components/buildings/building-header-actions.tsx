"use client";

import { deleteBuilding } from "@/app/instalaciones/actions";
import { BuildingDialog } from "@/components/buildings/building-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import type { Building } from "@/lib/types";

export function BuildingHeaderActions({ building }: { building: Building }) {
  return (
    <div className="flex items-center gap-1">
      <BuildingDialog building={building} />
      <DeleteConfirmButton
        itemLabel={`la instalación "${building.name}" y todos sus equipos`}
        onConfirm={() => deleteBuilding(building.id)}
        redirectTo="/instalaciones"
      />
    </div>
  );
}
