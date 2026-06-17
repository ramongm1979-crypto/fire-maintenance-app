"use client";

import { Pencil } from "lucide-react";
import { deleteAsset } from "@/app/instalaciones/[id]/actions";
import { NewAssetDialog } from "@/components/assets/new-asset-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/types";

export function AssetHeaderActions({
  buildingId,
  asset,
}: {
  buildingId: string;
  asset: Asset;
}) {
  return (
    <div className="flex items-center gap-2">
      <NewAssetDialog
        buildingId={buildingId}
        asset={asset}
        trigger={
          <Button variant="outline" size="icon">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DeleteConfirmButton
        itemLabel={`el equipo "${asset.code || asset.type}"`}
        onConfirm={() => deleteAsset(buildingId, asset.id)}
        redirectTo={`/instalaciones/${buildingId}`}
      />
    </div>
  );
}
