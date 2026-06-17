// Importa los Excel y manuales PDF existentes a Supabase.
// Uso: node scripts/import.mjs
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

// --- Configuración de entorno (lee .env.local manualmente) ---
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const INCENDIOS_DIR = "D:/TAL VEZ/Incendios";
const MANUALES_DIR = "D:/TAL VEZ/MANUALES";

// --- Utilidades ---

function normalizeHeader(h) {
  return String(h ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

const HEADER_MAP = {
  "PLANTA": "planta",
  "CODIGO": "codigo",
  "N SERIE": "serie",
  "NO SERIE": "serie",
  "TIPO": "tipo",
  "EFICACIA": "eficacia",
  "FABRICANTE": "fabricante",
  "CARGA EN KG": "carga",
  "CARGA": "carga",
  "FECHA FABRICACION": "fecha_fabricacion",
  "ULTIMO RETIMBRADO": "ultimo_retimbrado",
  "N RETIMBRADOS": "n_retimbrados",
  "FECHA CADUCIDAD": "fecha_caducidad",
  "UBICACION": "ubicacion",
  [normalizeHeader("Señalizacion extintor")]: "senalizacion",
  "FECHA CARTEL": "fecha_cartel",
  "ESTADO (PRESION,PESO, PRECINTO,MANGUERA, BOQUILLA Y ALTURA)": "estado",
  [normalizeHeader(
    "Observaciones (apuntar si faltan señales en donde y de qué, anomalias en la instalación, dificultad de acceso al equipo..)",
  )]: "observaciones",
};

function excelSerialToISO(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const mm = String(parsed.m).padStart(2, "0");
    const dd = String(parsed.d).padStart(2, "0");
    return `${parsed.y}-${mm}-${dd}`;
  }
  return null;
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const normalized = rows[i].map(normalizeHeader);
    if (normalized.includes("CODIGO") && normalized.some((h) => h.startsWith("PLANTA"))) {
      return i;
    }
  }
  return -1;
}

async function getOrCreateBuilding(name) {
  const { data: existing } = await supabase
    .from("buildings")
    .select("id")
    .ilike("name", name)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("buildings")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

// --- Importar extintores ---

const EXTINTOR_BUILDING_SHEETS = [
  "ASTURCON",
  "AVILES",
  "BUENAVISTAESTE",
  "BUENAVISTAOESTE",
  "EASMU",
  "EDUCACION",
  "FIDMA",
  "GIJON",
  "INDUSTRIA",
  "PIDAL",
  "PRESIDENCIA",
  "PERLORA",
  "RIDEA",
  "PROCURADORA GENERAL",
  "Independencia",
  "ADOLFO POSADA",
];

async function importExtintores() {
  const file = path.join(INCENDIOS_DIR, "extintores.xlsx");
  if (!fs.existsSync(file)) {
    console.log("⚠ No se encontró extintores.xlsx, se omite.");
    return;
  }
  const wb = XLSX.readFile(file, { cellDates: true });

  for (const sheetName of EXTINTOR_BUILDING_SHEETS) {
    if (!wb.SheetNames.includes(sheetName)) continue;
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
    const headerIdx = findHeaderRowIndex(rows);
    if (headerIdx === -1) {
      console.log(`⚠ ${sheetName}: no se encontró fila de cabecera, se omite.`);
      continue;
    }

    const headers = rows[headerIdx].map(normalizeHeader);
    const colIndex = {};
    headers.forEach((h, i) => {
      const key = HEADER_MAP[h];
      if (key) colIndex[key] = i;
    });

    const buildingId = await getOrCreateBuilding(sheetName);
    let count = 0;
    let lastPlanta = null;

    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every((c) => c == null || c === "")) continue;

      const codigo = colIndex.codigo != null ? row[colIndex.codigo] : null;
      const serie = colIndex.serie != null ? row[colIndex.serie] : null;
      if (!codigo && !serie) continue;

      const planta = colIndex.planta != null && row[colIndex.planta]
        ? String(row[colIndex.planta]).trim()
        : lastPlanta;
      lastPlanta = planta || lastPlanta;

      const asset = {
        building_id: buildingId,
        type: "extintor",
        code: codigo != null ? String(codigo).trim() : null,
        serial_number: serie != null ? String(serie).trim() : null,
        location: [planta, colIndex.ubicacion != null ? row[colIndex.ubicacion] : null]
          .filter(Boolean)
          .join(" - ") || null,
        brand: colIndex.fabricante != null ? row[colIndex.fabricante] : null,
        model: colIndex.tipo != null ? row[colIndex.tipo] : null,
        install_date: colIndex.fecha_fabricacion != null
          ? excelSerialToISO(row[colIndex.fecha_fabricacion])
          : null,
        last_check_date: colIndex.ultimo_retimbrado != null
          ? excelSerialToISO(row[colIndex.ultimo_retimbrado])
          : null,
        expiry_date: colIndex.fecha_caducidad != null
          ? excelSerialToISO(row[colIndex.fecha_caducidad])
          : null,
        next_due_date: colIndex.fecha_caducidad != null
          ? excelSerialToISO(row[colIndex.fecha_caducidad])
          : null,
        attributes: {
          eficacia: colIndex.eficacia != null ? row[colIndex.eficacia] : null,
          carga: colIndex.carga != null ? row[colIndex.carga] : null,
          n_retimbrados: colIndex.n_retimbrados != null ? row[colIndex.n_retimbrados] : null,
          estado: colIndex.estado != null ? row[colIndex.estado] : null,
          observaciones: colIndex.observaciones != null ? row[colIndex.observaciones] : null,
        },
      };

      const { error } = await supabase.from("assets").insert(asset);
      if (error) {
        console.log(`  ✗ Error insertando extintor en ${sheetName}:`, error.message);
      } else {
        count++;
      }
    }
    console.log(`✓ ${sheetName}: ${count} extintores importados.`);
  }
}

// --- Importar detectores (Avilés) ---

async function importDetectores() {
  const file = path.join(INCENDIOS_DIR, "listado detectores Aviles.xlsx");
  if (!fs.existsSync(file)) {
    console.log("⚠ No se encontró listado detectores Aviles.xlsx, se omite.");
    return;
  }
  const wb = XLSX.readFile(file, { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

  const buildingId = await getOrCreateBuilding("AVILES");
  let count = 0;
  let lastPlanta = null;

  for (const row of rows) {
    const get = (target) => {
      const targetNorm = normalizeHeader(target);
      const key = Object.keys(row).find((k) => normalizeHeader(k) === targetNorm);
      return key ? row[key] : null;
    };

    const planta = get("Planta") ? String(get("Planta")).trim() : lastPlanta;
    lastPlanta = planta || lastPlanta;
    const codigoCentral = get("Nº detector en central");
    const codigoPlano = get("Nº detector en plano");
    const serie = get("Nº Serie");
    if (!codigoCentral && !codigoPlano) continue;

    const asset = {
      building_id: buildingId,
      type: "detector",
      code: codigoCentral != null ? String(codigoCentral).trim() : null,
      location: planta,
      serial_number: serie != null ? String(serie).trim() : null,
      attributes: {
        numero_plano: codigoPlano,
        observaciones: get("Observaciones"),
      },
    };

    const { error } = await supabase.from("assets").insert(asset);
    if (error) {
      console.log("  ✗ Error insertando detector:", error.message);
    } else {
      count++;
    }
  }
  console.log(`✓ AVILES: ${count} detectores importados.`);
}

// --- Importar incidencias ---

const INCIDENCIAS_FILES = [
  { file: "incidencias incendios asturcon.xlsx", building: "ASTURCON" },
  { file: "incidencias incendios calatrava.xlsx", building: "CALATRAVA" },
  { file: "incidencias incendios pidal.xlsx", building: "PIDAL" },
  { file: "incidencias incendios industria.xlsx", building: "INDUSTRIA" },
];

async function importIncidencias() {
  for (const { file, building } of INCIDENCIAS_FILES) {
    const fullPath = path.join(INCENDIOS_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠ No se encontró ${file}, se omite.`);
      continue;
    }
    const wb = XLSX.readFile(fullPath, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

    const buildingId = await getOrCreateBuilding(building);
    const { data: assets } = await supabase
      .from("assets")
      .select("id, code")
      .eq("building_id", buildingId);
    const assetByCode = new Map(
      (assets ?? []).filter((a) => a.code).map((a) => [String(a.code).trim().toUpperCase(), a.id]),
    );

    let matched = 0;
    let unmatched = 0;

    for (const row of rows) {
      const get = (target) => {
        const targetNorm = normalizeHeader(target);
        const key = Object.keys(row).find((k) => normalizeHeader(k) === targetNorm);
        return key ? row[key] : null;
      };

      const fecha = excelSerialToISO(get("Fecha"));
      const codigoCentral = get("Nº detector central");
      const elemento = get("Elemento") ?? "";
      const descripcionPartes = [get("Averia"), get("Incedencia"), get("Observaciones")].filter(
        Boolean,
      );

      const code = codigoCentral != null ? String(codigoCentral).trim().toUpperCase() : null;
      const assetId = code ? assetByCode.get(code) : null;

      if (!assetId) {
        unmatched++;
        continue;
      }

      const { error } = await supabase.from("maintenance_events").insert({
        asset_id: assetId,
        event_date: fecha ?? new Date().toISOString().slice(0, 10),
        event_type: "incidencia",
        description: [elemento, ...descripcionPartes].filter(Boolean).join(" — "),
        technician: get("Tecnico"),
      });
      if (error) {
        console.log("  ✗ Error insertando incidencia:", error.message);
      } else {
        matched++;
      }
    }
    console.log(
      `✓ ${building}: ${matched} incidencias importadas, ${unmatched} sin equipo coincidente (se omitieron).`,
    );
  }
}

// --- Importar manuales ---

const MANUAL_FILES = [
  { file: "CENTRAL INCENDIO HONEYWELL.pdf", title: "Central de incendios Honeywell", brand: "Honeywell", asset_type: "central" },
  { file: "CENTRAL INCENDIO kfp-af.pdf", title: "Central de incendios KFP-AF", brand: "KFP-AF", asset_type: "central" },
  { file: "CENTRAL INCENDIO KILSEN INSTALACION.pdf", title: "Central de incendios Kilsen - Instalación", brand: "Kilsen", asset_type: "central" },
  { file: "CENTRAL INCENDIO KILSEN.pdf", title: "Central de incendios Kilsen", brand: "Kilsen", asset_type: "central" },
  { file: "CENTRAL INCENDIO smartline0202 .pdf", title: "Central de incendios Smartline", brand: "Smartline", asset_type: "central" },
  { file: "CENTRAL INCENDIO xls80e.pdf", title: "Central de incendios XLS80E", brand: "XLS80E", asset_type: "central" },
  { file: "CENTRAL INCENDIO SIEMENS .pdf", title: "Central de incendios Siemens", brand: "Siemens", asset_type: "central" },
  { file: "COMPUERTAS CORTAFUEGO.pdf", title: "Compuertas cortafuego", brand: null, asset_type: "compuerta" },
  { file: "DESIGO Usuario V 3.0 - 1 - Español.pdf", title: "Desigo - Manual usuario V3.0 (1)", brand: "Siemens", asset_type: "central" },
  { file: "DESIGO Usuario V 3.0 - 2 - Español.pdf", title: "Desigo - Manual usuario V3.0 (2)", brand: "Siemens", asset_type: "central" },
  { file: "DESIGO Usuario V2.3 - Español.pdf", title: "Desigo - Manual usuario V2.3", brand: "Siemens", asset_type: "central" },
  { file: "DETECCION CPD esq cuadro.pdf", title: "Detección CPD - Esquema cuadro", brand: null, asset_type: "detector" },
  { file: "DETECCION CPD esq.principio.pdf.pdf", title: "Detección CPD - Esquema de principio", brand: null, asset_type: "detector" },
];

async function importManuales() {
  for (const manual of MANUAL_FILES) {
    const fullPath = path.join(MANUALES_DIR, manual.file);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠ No se encontró el manual ${manual.file}, se omite.`);
      continue;
    }
    const fileBuffer = fs.readFileSync(fullPath);
    const safeName = manual.file.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("Manuales")
      .upload(storagePath, fileBuffer, { contentType: "application/pdf" });
    if (uploadError) {
      console.log(`  ✗ Error subiendo ${manual.file}:`, uploadError.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from("Manuales").getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("manuals").insert({
      title: manual.title,
      brand: manual.brand,
      asset_type: manual.asset_type,
      file_url: publicUrlData.publicUrl,
    });
    if (insertError) {
      console.log(`  ✗ Error guardando registro de ${manual.file}:`, insertError.message);
    } else {
      console.log(`✓ Manual subido: ${manual.title}`);
    }
  }
}

// --- Ejecución ---

async function main() {
  console.log("Importando extintores...");
  await importExtintores();

  console.log("\nImportando detectores...");
  await importDetectores();

  console.log("\nImportando incidencias...");
  await importIncidencias();

  console.log("\nImportando manuales...");
  await importManuales();

  console.log("\nImportación completada.");
}

main().catch((err) => {
  console.error("Error fatal en la importación:", err);
  process.exit(1);
});
