"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { homeFor, type AccountRole } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
  // Chemin interne seulement : « //hote » ou « /\hote » mèneraient hors du site.
  next: z
    .string()
    .regex(/^\/(?![/\\])/)
    .optional(),
});

/**
 * Connexion par e-mail et mot de passe. Les comptes se créent pour l'instant dans le dashboard
 * Supabase ; un nouveau compte est photographe par défaut (trigger handle_new_user).
 */
export async function signIn(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) redirect("/login?error=invalid_form");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    const code = error?.code;
    const params = new URLSearchParams({
      error: code === "invalid_credentials" || code === "email_not_confirmed" ? code : "signin_failed",
    });
    if (parsed.data.next) params.set("next", parsed.data.next);
    redirect(`/login?${params}`);
  }

  if (parsed.data.next) redirect(parsed.data.next);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  redirect(profile ? homeFor(profile.role as AccountRole) : "/login?error=profile_missing");
}
