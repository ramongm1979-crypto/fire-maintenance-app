"use client";

export const DEFAULT_ASSET_COLUMN_LABELS = {
  location: "Ubicación",
  code: "Código",
  brand: "Marca / Modelo",
  serial_number: "Nº Serie",
  next_due_date: "Próximo vencimiento",
  status: "Estado",
} as const;

export type AssetColumnKey = keyof typeof DEFAULT_ASSET_COLUMN_LABELS;

export const FIXED_COLUMN_KEYS: AssetColumnKey[] = [
  "location",
  "code",
  "brand",
  "serial_number",
  "next_due_date",
  "status",
];

export type AssetTablePrefs = {
  labels: Record<string, string>;
  order: string[];
  widths: Record<string, number>;
  extraAttributeKeys: string[];
};

const STORAGE_KEY = "fm_assets_table_prefs_v2";

function defaultPrefs(): AssetTablePrefs {
  return {
    labels: { ...DEFAULT_ASSET_COLUMN_LABELS },
    order: [...FIXED_COLUMN_KEYS],
    widths: {},
    extraAttributeKeys: [],
  };
}

export function loadAssetTablePrefs(): AssetTablePrefs {
  if (typeof window === "undefined") return defaultPrefs();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw);
    const base = defaultPrefs();
    return {
      labels: { ...base.labels, ...parsed.labels },
      order: Array.isArray(parsed.order) && parsed.order.length > 0 ? parsed.order : base.order,
      widths: typeof parsed.widths === "object" && parsed.widths ? parsed.widths : {},
      extraAttributeKeys: Array.isArray(parsed.extraAttributeKeys)
        ? parsed.extraAttributeKeys
        : [],
    };
  } catch {
    return defaultPrefs();
  }
}

export function saveAssetTablePrefs(prefs: AssetTablePrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** Devuelve las columnas visibles, en orden, combinando fijas + extras activas. */
export function getVisibleColumns(
  prefs: AssetTablePrefs,
  availableAttributeKeys: string[],
): { key: string; label: string; isExtra: boolean }[] {
  const activeExtra = prefs.extraAttributeKeys.filter((k) => availableAttributeKeys.includes(k));
  const allKeys = [...FIXED_COLUMN_KEYS, ...activeExtra];

  const ordered = [
    ...prefs.order.filter((k) => allKeys.includes(k)),
    ...allKeys.filter((k) => !prefs.order.includes(k)),
  ];

  return ordered.map((key) => ({
    key,
    label: prefs.labels[key] ?? key,
    isExtra: !FIXED_COLUMN_KEYS.includes(key as AssetColumnKey),
  }));
}
