import { Flame, Droplet, Radio, Cpu, DoorClosed, type LucideIcon } from "lucide-react";

export type DueState = "vencido" | "aviso" | "ok" | "sin_fecha";

const WARNING_WINDOW_DAYS = 30;

export function getDueState(nextDueDate: string | null): DueState {
  if (!nextDueDate) return "sin_fecha";

  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return "vencido";
  if (diffDays <= WARNING_WINDOW_DAYS) return "aviso";
  return "ok";
}

export const DUE_STATE_LABEL: Record<DueState, string> = {
  vencido: "Vencido",
  aviso: "Próximo",
  ok: "Al día",
  sin_fecha: "Sin fecha",
};

export const DUE_STATE_BADGE_VARIANT: Record<
  DueState,
  "destructive" | "default" | "secondary" | "outline"
> = {
  vencido: "destructive",
  aviso: "default",
  ok: "secondary",
  sin_fecha: "outline",
};

export const ASSET_TYPE_LABEL: Record<string, string> = {
  extintor: "Extintor",
  bie: "BIE",
  detector: "Detector",
  central: "Central de incendios",
  compuerta: "Compuerta cortafuego",
};

export const ASSET_TYPE_ICON: Record<string, LucideIcon> = {
  extintor: Flame,
  bie: Droplet,
  detector: Radio,
  central: Cpu,
  compuerta: DoorClosed,
};

export const ASSET_TYPE_COLOR: Record<string, string> = {
  extintor: "text-orange-600 bg-orange-100 dark:bg-orange-950",
  bie: "text-blue-600 bg-blue-100 dark:bg-blue-950",
  detector: "text-violet-600 bg-violet-100 dark:bg-violet-950",
  central: "text-slate-600 bg-slate-100 dark:bg-slate-800",
  compuerta: "text-amber-600 bg-amber-100 dark:bg-amber-950",
};
