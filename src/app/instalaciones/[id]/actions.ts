"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssetType } from "@/lib/types";

export async function createAsset(buildingId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("assets").insert({
    building_id: buildingId,
    type: formData.get("type") as AssetType,
    code: (formData.get("code") as string) || null,
    location: (formData.get("location") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    serial_number: (formData.get("serial_number") as string) || null,
    install_date: (formData.get("install_date") as string) || null,
    expiry_date: (formData.get("expiry_date") as string) || null,
    next_due_date: (formData.get("next_due_date") as string) || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/instalaciones/${buildingId}`);
}
