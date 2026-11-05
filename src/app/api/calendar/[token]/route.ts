import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { toIcs, type FeedRow } from "@/lib/ics";
import { APP_URL, PRODUCT_NAME } from "@/lib/site";
import { supabaseConfigured } from "@/lib/supabase/env";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Flux iCal privé d'un photographe : /api/calendar/<jeton>.ics, interrogé sans session par Google Agenda,
 * Apple Calendar ou Outlook. Pas de clé secrète : la fonction calendar_feed ne renvoie que les dates du
 * photographe qui possède ce jeton, et rien pour un jeton inconnu.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/calendar/[token]">) {
  const { token: raw } = await ctx.params;
  const token = raw.replace(/\.ics$/i, "");
  if (!supabaseConfigured || !UUID.test(token)) return new Response("Calendrier introuvable", { status: 404 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.rpc("calendar_feed", { feed_token: token });
  if (error) return new Response("Calendrier indisponible", { status: 503 });

  return new Response(toIcs((data ?? []) as FeedRow[], PRODUCT_NAME, new URL(APP_URL).host), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="calendrier.ics"',
      // Le jeton est un secret : pas de cache partagé.
      "Cache-Control": "private, max-age=300",
    },
  });
}
