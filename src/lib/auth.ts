import { redirect } from "next/navigation";
import { connection } from "next/server";
import { homeFor, type AccountRole } from "@/lib/roles";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string | null;
}

export interface Profile {
  id: string;
  role: AccountRole;
  full_name: string | null;
  studio_name: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  // Toujours rendu à la requête, même sans Supabase configuré.
  await connection();
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: (claims.email as string | undefined) ?? null };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, role, full_name, studio_name").eq("id", userId).maybeSingle();
  return data as Profile | null;
}

/**
 * Garde d'un espace : sans session, /login ; avec un autre rôle, l'espace de ce rôle.
 * À appeler en tête du layout de /studio et de /espace.
 */
export async function requireRole(role: AccountRole, from: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(from)}`);
  const profile = await getProfile(user.id);
  if (!profile) redirect("/login?error=profile_missing");
  if (profile.role !== role) redirect(homeFor(profile.role));
  return { user, profile };
}

/** ADMIN_EMAILS, en minuscules : accès au back-office /admin. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}
