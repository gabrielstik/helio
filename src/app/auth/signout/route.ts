import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${APP_URL}/login`, { status: 303 });
}
