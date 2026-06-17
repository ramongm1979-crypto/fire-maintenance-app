"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarRowActions } from "@/components/calendar/calendar-row-actions";
import { EmptyState } from "@/components/empty-state";
import {
  getDueState,
  DUE_STATE_LABEL,
  DUE_STATE_BADGE_VARIANT,
  ASSET_TYPE_LABEL,
  ASSET_TYPE_ICON,
  ASSET_TYPE_COLOR,
} from "@/lib/asset-status";
import { cn } from "@/lib/utils";
import type { Asset, Building } from "@/lib/types";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function MonthCalendar({
  assets,
  buildingById,
}: {
  assets: Asset[];
  buildingById: Record<string, Building>;
}) {
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const assetsByDay = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (!asset.next_due_date) continue;
      const key = asset.next_due_date;
      const list = map.get(key) ?? [];
      list.push(asset);
      map.set(key, list);
    }
    return map;
  }, [assets]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedAssets = selectedDay
    ? assetsByDay.get(format(selectedDay, "yyyy-MM-dd")) ?? []
    : [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="py-5">
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold capitalize">
              {format(month, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayAssets = assetsByDay.get(key) ?? [];
              const vencidos = dayAssets.filter((a) => getDueState(a.next_due_date) === "vencido").length;
              const proximos = dayAssets.filter((a) => getDueState(a.next_due_date) === "aviso").length;
              const inMonth = isSameMonth(day, month);
              const selected = selectedDay && isSameDay(day, selectedDay);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-sm transition-colors hover:bg-muted",
                    !inMonth && "text-muted-foreground/40",
                    isToday(day) && "border-destructive/40 font-semibold",
                    selected && "bg-destructive text-white hover:bg-destructive",
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {dayAssets.length > 0 && (
                    <span className="flex items-center gap-0.5">
                      {vencidos > 0 && (
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            selected ? "bg-white" : "bg-destructive",
                          )}
                        />
                      )}
                      {proximos > 0 && (
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            selected ? "bg-white" : "bg-amber-500",
                          )}
                        />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="py-5">
        <CardContent className="space-y-3">
          <h3 className="font-semibold">
            {selectedDay
              ? format(selectedDay, "d 'de' MMMM", { locale: es })
              : "Selecciona un día"}
          </h3>
          {!selectedDay ? (
            <EmptyState
              icon={CalendarDays}
              title="Ningún día seleccionado"
              description="Haz clic en un día del calendario para ver sus vencimientos."
            />
          ) : selectedAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay vencimientos este día.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedAssets.map((asset) => {
                const Icon = ASSET_TYPE_ICON[asset.type];
                const dueState = getDueState(asset.next_due_date);
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                  >
                    <Link
                      href={`/instalaciones/${asset.building_id}/equipos/${asset.id}`}
                      className="flex min-w-0 items-center gap-2.5"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          ASSET_TYPE_COLOR[asset.type],
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <p className="truncate text-sm font-medium hover:underline">
                          {ASSET_TYPE_LABEL[asset.type]} {asset.code ? `· ${asset.code}` : ""}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {buildingById[asset.building_id]?.name}
                        </p>
                      </span>
                    </Link>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge variant={DUE_STATE_BADGE_VARIANT[dueState]} className="hidden sm:inline-flex">
                        {DUE_STATE_LABEL[dueState]}
                      </Badge>
                      <CalendarRowActions asset={asset} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
