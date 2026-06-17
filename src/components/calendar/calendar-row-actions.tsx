"use client";

import { Pencil } from "lucide-react";
import { deleteAsset } from "@/app/instalaciones/[id]/actions";
import { NewAssetDialog } from "@/components/assets/new-asset-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/types";

export function CalendarRowActions({ asset }: { asset: Asset }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <NewAssetDialog
        buildingId={asset.building_id}
        asset={asset}
        trigger={
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DeleteConfirmButton
        itemLabel={`el equipo "${asset.code || asset.type}"`}
        onConfirm={() => deleteAsset(asset.building_id, asset.id)}
      />
    </div>
  );
}
