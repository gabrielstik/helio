"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { APP_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email(),
  next: z.string().startsWith("/").default("/studio/crm"),
});

/**
 * Lien magique par e-mail. Un nouveau compte est photographe par défaut
 * (trigger handle_new_user) ; un client y entre par l'invitation de son photographe.
 */
export async function sendMagicLink(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email"), next: formData.get("next") || undefined });
  if (!parsed.success) redirect("/login?error=invalid_email");

  const supabase = await createClient();
  const callback = new URL("/auth/callback", APP_URL);
  callback.searchParams.set("next", parsed.data.next);
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callback.toString() },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?sent=1");
}
