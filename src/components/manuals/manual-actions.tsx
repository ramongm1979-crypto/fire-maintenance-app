"use client";

import { Pencil } from "lucide-react";
import { deleteManual } from "@/app/manuales/actions";
import { NewManualDialog } from "@/components/manuals/new-manual-dialog";
import { DeleteConfirmButton } from "@/components/delete-confirm-button";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import type { Manual } from "@/lib/types";

export function ManualActions({ manual }: { manual: Manual }) {
  return (
    <div className="flex items-center gap-1">
      <ShareButton title={manual.title} url={manual.file_url} />
      <NewManualDialog
        manual={manual}
        trigger={
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
          </Button>
        }
      />
      <DeleteConfirmButton
        itemLabel={`el manual "${manual.title}"`}
        onConfirm={() => deleteManual(manual.id, manual.file_url)}
      />
    </div>
  );
}
