"use client";

import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSET_TYPE_LABEL } from "@/lib/asset-status";
import type { Asset, Building } from "@/lib/types";

export function ExportExcelButton({
  building,
  assets,
}: {
  building: Building;
  assets: Asset[];
}) {
  function handleExport() {
    const rows = assets.map((asset) => ({
      Tipo: ASSET_TYPE_LABEL[asset.type] ?? asset.type,
      Ubicación: asset.location ?? "",
      Código: asset.code ?? "",
      Marca: asset.brand ?? "",
      Modelo: asset.model ?? "",
      "Nº Serie": asset.serial_number ?? "",
      "Fecha instalación": asset.install_date ?? "",
      "Fecha caducidad": asset.expiry_date ?? "",
      "Última revisión": asset.last_check_date ?? "",
      "Próxima revisión": asset.next_due_date ?? "",
      Observaciones: asset.attributes?.observaciones
        ? String(asset.attributes.observaciones)
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, building.name.slice(0, 31));

    const safeName = building.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    XLSX.writeFile(workbook, `${safeName}_equipos.xlsx`);
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <FileSpreadsheet className="size-4" />
      Exportar a Excel
    </Button>
  );
}
