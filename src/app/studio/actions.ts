"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Une note de client lue : elle quitte « À faire » sur la vue d'ensemble. */
export async function markNoteRead(formData: FormData) {
  const id = z.guid().safeParse(formData.get("note_id"));
  const user = await getSessionUser();
  if (!id.success || !user) return;
  const supabase = await createClient();
  await supabase.from("client_notes").update({ read_at: new Date().toISOString() }).eq("id", id.data).eq("photographer_id", user.id);
  revalidatePath("/studio");
}
