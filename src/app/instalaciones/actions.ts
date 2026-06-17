"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBuilding(formData: FormData) {
  const name = formData.get("name") as string;
  const address = (formData.get("address") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const supabase = await createClient();
  const { error } = await supabase.from("buildings").insert({ name, address, notes });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/instalaciones");
}

export async function updateBuilding(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const address = (formData.get("address") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("buildings")
    .update({ name, address, notes })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/instalaciones");
  revalidatePath(`/instalaciones/${id}`);
}

export async function deleteBuilding(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("buildings").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/instalaciones");
  revalidatePath("/");
  revalidatePath("/calendario");
}
