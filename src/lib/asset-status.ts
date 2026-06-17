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
