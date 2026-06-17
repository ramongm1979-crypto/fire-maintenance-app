"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssetType } from "@/lib/types";

function storagePathFromUrl(url: string): string | null {
  const marker = "/object/public/Manuales/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function createManual(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { error: "Selecciona un archivo PDF." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("Manuales")
    .upload(path, file, { contentType: file.type || "application/pdf" });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage.from("Manuales").getPublicUrl(path);

  const { error: insertError } = await supabase.from("manuals").insert({
    title: formData.get("title") as string,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    asset_type: (formData.get("asset_type") as AssetType) || null,
    notes: (formData.get("notes") as string) || null,
    file_url: publicUrlData.publicUrl,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/manuales");
}

export async function updateManual(id: string, currentFileUrl: string, formData: FormData) {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    title: formData.get("title") as string,
    brand: (formData.get("brand") as string) || null,
    model: (formData.get("model") as string) || null,
    asset_type: (formData.get("asset_type") as AssetType) || null,
    notes: (formData.get("notes") as string) || null,
  };

  const file = formData.get("file") as File;
  if (file && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("Manuales")
      .upload(path, file, { contentType: file.type || "application/pdf" });
    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from("Manuales").getPublicUrl(path);
    payload.file_url = publicUrlData.publicUrl;

    const oldPath = storagePathFromUrl(currentFileUrl);
    if (oldPath) {
      await supabase.storage.from("Manuales").remove([oldPath]);
    }
  }

  const { error } = await supabase.from("manuals").update(payload).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/manuales");
}

export async function deleteManual(id: string, fileUrl: string) {
  const supabase = await createClient();

  const storagePath = storagePathFromUrl(fileUrl);
  if (storagePath) {
    await supabase.storage.from("Manuales").remove([storagePath]);
  }

  const { error } = await supabase.from("manuals").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/manuales");
}
