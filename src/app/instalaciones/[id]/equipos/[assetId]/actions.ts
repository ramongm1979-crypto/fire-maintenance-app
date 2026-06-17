"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EventType } from "@/lib/types";

async function uploadPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  prefix: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${prefix}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("Manuales")
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (!error) {
      const { data } = supabase.storage.from("Manuales").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
  }
  return urls;
}

export async function createMaintenanceEvent(
  buildingId: string,
  assetId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const eventDate =
    (formData.get("event_date") as string) || new Date().toISOString().slice(0, 10);

  const photoFiles = formData.getAll("photos") as File[];
  const attachments = await uploadPhotos(supabase, `fotos/eventos/${assetId}`, photoFiles);

  const { error } = await supabase.from("maintenance_events").insert({
    asset_id: assetId,
    event_date: eventDate,
    event_type: formData.get("event_type") as EventType,
    description: (formData.get("description") as string) || null,
    technician: (formData.get("technician") as string) || null,
    attachments,
  });

  if (error) {
    return { error: error.message };
  }

  const newNextDueDate = (formData.get("new_next_due_date") as string) || null;
  if (newNextDueDate) {
    const { error: assetError } = await supabase
      .from("assets")
      .update({ last_check_date: eventDate, next_due_date: newNextDueDate })
      .eq("id", assetId);
    if (assetError) {
      return { error: assetError.message };
    }
  }

  revalidatePath(`/instalaciones/${buildingId}/equipos/${assetId}`);
  revalidatePath(`/instalaciones/${buildingId}`);
  revalidatePath("/");
  revalidatePath("/calendario");
}

export async function addAssetPhotos(buildingId: string, assetId: string, formData: FormData) {
  const supabase = await createClient();

  const files = formData.getAll("photos") as File[];
  const newUrls = await uploadPhotos(supabase, `fotos/equipos/${assetId}`, files);
  if (newUrls.length === 0) {
    return { error: "Selecciona al menos una foto." };
  }

  const { data: asset, error: fetchError } = await supabase
    .from("assets")
    .select("attributes")
    .eq("id", assetId)
    .single();
  if (fetchError) return { error: fetchError.message };

  const attributes = (asset?.attributes as Record<string, unknown>) ?? {};
  const existing = Array.isArray(attributes._photos) ? (attributes._photos as string[]) : [];

  const { error } = await supabase
    .from("assets")
    .update({ attributes: { ...attributes, _photos: [...existing, ...newUrls] } })
    .eq("id", assetId);
  if (error) return { error: error.message };

  revalidatePath(`/instalaciones/${buildingId}/equipos/${assetId}`);
}

export async function removeAssetPhoto(buildingId: string, assetId: string, url: string) {
  const supabase = await createClient();

  const { data: asset, error: fetchError } = await supabase
    .from("assets")
    .select("attributes")
    .eq("id", assetId)
    .single();
  if (fetchError) return { error: fetchError.message };

  const attributes = (asset?.attributes as Record<string, unknown>) ?? {};
  const existing = Array.isArray(attributes._photos) ? (attributes._photos as string[]) : [];

  const { error } = await supabase
    .from("assets")
    .update({ attributes: { ...attributes, _photos: existing.filter((u) => u !== url) } })
    .eq("id", assetId);
  if (error) return { error: error.message };

  revalidatePath(`/instalaciones/${buildingId}/equipos/${assetId}`);
}
