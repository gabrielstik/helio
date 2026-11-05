"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { parisToUtc } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export interface EventFormState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  client_id: z.guid(),
  title: z.string().trim().min(1).max(200),
  day: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.coerce.number().int().min(15).max(720),
  location: z.string().trim().max(200),
});

/** Nouveau rendez-vous avec un client, à l'heure de Paris. La RLS vérifie que le client est bien au photographe. */
export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const parsed = schema.safeParse({
    client_id: formData.get("client_id"),
    title: formData.get("title"),
    day: formData.get("day"),
    time: formData.get("time"),
    duration: formData.get("duration"),
    location: formData.get("location") ?? "",
  });
  if (!parsed.success) return { error: "Choisissez un client et renseignez le titre, le jour et l'heure." };

  const user = await getSessionUser();
  if (!user) return { error: "Votre session a expiré : reconnectez-vous." };

  const startsAt = parisToUtc(parsed.data.day, parsed.data.time);
  const supabase = await createClient();
  const { error } = await supabase.from("client_events").insert({
    client_id: parsed.data.client_id,
    photographer_id: user.id,
    title: parsed.data.title,
    starts_at: startsAt.toISOString(),
    ends_at: new Date(startsAt.getTime() + parsed.data.duration * 60_000).toISOString(),
    location: parsed.data.location || null,
  });
  if (error) return { error: "Le rendez-vous n'a pas pu être enregistré. Réessayez." };

  revalidatePath("/studio/calendrier");
  revalidatePath("/studio");
  return { ok: true };
}

/** Nouvelle adresse pour le flux iCal : l'ancienne cesse de répondre (lien partagé par erreur, par exemple). */
export async function rotateCalendarToken(): Promise<EventFormState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rotate_calendar_token");
  if (error || !data) return { error: "L'adresse n'a pas pu être changée. Réessayez." };
  revalidatePath("/studio/calendrier");
  return { ok: true };
}
