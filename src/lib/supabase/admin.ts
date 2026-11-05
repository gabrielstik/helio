import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Une vraie clé serveur est configurée : une clé `sb_secret_…`, ou l'ancienne clé JWT `service_role`.
 * Une clé publishable ou anon passerait les requêtes sous RLS et renverrait des listes vides sans erreur.
 */
export function hasSecretKey(): boolean {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !key) return false;
  if (key.startsWith("sb_secret_")) return true;
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString("utf8"));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

/** Client avec la clé secrète. Serveur uniquement ; contourne la RLS. */
export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variable");
  }
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}
