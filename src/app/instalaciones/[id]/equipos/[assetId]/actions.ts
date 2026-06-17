"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/types";

export async function createMaintenanceEvent(
  buildingId: string,
  assetId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const { error } = await supabase.from("maintenance_events").insert({
    asset_id: assetId,
    event_date: (formData.get("event_date") as string) || new Date().toISOString().slice(0, 10),
    event_type: formData.get("event_type") as EventType,
    description: (formData.get("description") as string) || null,
    technician: (formData.get("technician") as string) || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/instalaciones/${buildingId}/equipos/${assetId}`);
}
