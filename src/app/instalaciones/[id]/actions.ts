"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssetType } from "@/lib/types";

function buildAttributes(formData: FormData) {
  const attributes: Record<string, string> = {};

  const observaciones = (formData.get("observaciones") as string) || "";
  if (observaciones) attributes.observaciones = observaciones;

  const keys = formData.getAll("attr_key") as string[];
  const values = formData.getAll("attr_value") as string[];
  keys.forEach((key, i) => {
    const trimmedKey = key.trim();
    if (trimmedKey) attributes[trimmedKey] = values[i] ?? "";
  });

  return attributes;
}

function assetPayload(formData: FormData) {
  return {
    type: formData.get("type") as AssetType,
    code: (formData.get("code") as string) || null,
    location: (formData.get("location") as string) || null,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    serial_number: (formData.get("serial_number") as string) || null,
    install_date: (formData.get("install_date") as string) || null,
    expiry_date: (formData.get("expiry_date") as string) || null,
    next_due_date: (formData.get("next_due_date") as string) || null,
    attributes: buildAttributes(formData),
  };
}

export async function createAsset(buildingId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("assets").insert({
    building_id: buildingId,
    ...assetPayload(formData),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/instalaciones/${buildingId}`);
  revalidatePath("/");
  revalidatePath("/calendario");
}

export async function updateAsset(buildingId: string, assetId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("assets")
    .update(assetPayload(formData))
    .eq("id", assetId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/instalaciones/${buildingId}`);
  revalidatePath(`/instalaciones/${buildingId}/equipos/${assetId}`);
  revalidatePath("/");
  revalidatePath("/calendario");
}

export async function deleteAsset(buildingId: string, assetId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", assetId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/instalaciones/${buildingId}`);
  revalidatePath("/");
  revalidatePath("/calendario");
}
