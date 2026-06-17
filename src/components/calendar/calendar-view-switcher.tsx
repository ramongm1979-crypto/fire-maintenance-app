"use client";

import { useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { CalendarTable } from "@/components/calendar/calendar-table";
import type { Asset, Building } from "@/lib/types";

export function CalendarViewSwitcher({
  assets,
  buildingById,
}: {
  assets: Asset[];
  buildingById: Record<string, Building>;
}) {
  const [view, setView] = useState<"calendar" | "list">("calendar");

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
        <Button
          type="button"
          size="sm"
          variant={view === "calendar" ? "default" : "ghost"}
          onClick={() => setView("calendar")}
          className={view === "calendar" ? "" : "text-muted-foreground"}
        >
          <CalendarDays className="size-4" />
          Calendario
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "list" ? "default" : "ghost"}
          onClick={() => setView("list")}
          className={view === "list" ? "" : "text-muted-foreground"}
        >
          <List className="size-4" />
          Lista
        </Button>
      </div>

      {view === "calendar" ? (
        <MonthCalendar assets={assets} buildingById={buildingById} />
      ) : (
        <CalendarTable assets={assets} buildingById={buildingById} />
      )}
    </div>
  );
}
