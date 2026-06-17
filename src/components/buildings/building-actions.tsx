"use client";

import { deleteBuilding } from "@/app/instalaciones/actions";
import { BuildingDialog } from "@/components/buildings/building-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import type { Building } from "@/lib/types";

export function BuildingActions({ building }: { building: Building }) {
  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <BuildingDialog building={building} />
      <DeleteConfirmButton
        itemLabel={`la instalación "${building.name}"`}
        onConfirm={() => deleteBuilding(building.id)}
      />
    </div>
  );
}
