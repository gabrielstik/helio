import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { homeFor } from "@/lib/roles";
import { APP_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/** Échange le code PKCE du lien magique contre une session, puis ouvre l'espace du rôle. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const profile = await getProfile(data.user.id);
      const dest = next?.startsWith("/") && !next.startsWith("//") ? next : profile ? homeFor(profile.role) : "/";
      return NextResponse.redirect(`${APP_URL}${dest}`);
    }
  }

  return NextResponse.redirect(`${APP_URL}/login?error=auth_callback_failed`);
}
