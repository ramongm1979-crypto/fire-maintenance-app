import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDueState, DUE_STATE_LABEL, DUE_STATE_BADGE_VARIANT } from "@/lib/asset-status";
import type { Asset } from "@/lib/types";

export function AssetsTable({ assets, buildingId }: { assets: Asset[]; buildingId: string }) {
  if (assets.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No hay equipos de este tipo todavía.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Marca / Modelo</TableHead>
          <TableHead>Nº Serie</TableHead>
          <TableHead>Próximo vencimiento</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => {
          const dueState = getDueState(asset.next_due_date);
          return (
            <TableRow key={asset.id} className="cursor-pointer">
              <TableCell>
                <Link
                  href={`/instalaciones/${buildingId}/equipos/${asset.id}`}
                  className="font-medium hover:underline"
                >
                  {asset.code || "—"}
                </Link>
              </TableCell>
              <TableCell>{asset.location || "—"}</TableCell>
              <TableCell>
                {[asset.brand, asset.model].filter(Boolean).join(" / ") || "—"}
              </TableCell>
              <TableCell>{asset.serial_number || "—"}</TableCell>
              <TableCell>{asset.next_due_date || "—"}</TableCell>
              <TableCell>
                <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]}>
                  {DUE_STATE_LABEL[dueState]}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
