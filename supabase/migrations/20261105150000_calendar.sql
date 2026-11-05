-- Calendrier du photographe : durée des rendez-vous, flux iCal privé (Google Agenda, Apple, Outlook).

-- Fin d'un rendez-vous ; sans elle, le flux compte une heure.
alter table public.client_events add column ends_at timestamptz;
alter table public.client_events add constraint client_events_ends_after_start check (ends_at is null or ends_at > starts_at);
create index client_events_photographer_starts_idx on public.client_events (photographer_id, starts_at);

-- Un rendez-vous ne peut viser qu'un client du même photographe : sinon un photographe pourrait écrire
-- dans l'espace du client d'un autre (la politique « client : ses dates » lit par client_id).
drop policy "photographe" on public.client_events;
create policy "photographe" on public.client_events for all
  using (photographer_id = auth.uid())
  with check (
    photographer_id = auth.uid()
    and exists (select 1 from public.clients c where c.id = client_id and c.photographer_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Flux iCal : une adresse secrète par photographe, que l'agenda interroge sans session
-- ---------------------------------------------------------------------------

alter table public.profiles add column calendar_token uuid not null unique default gen_random_uuid();

-- Nouveau jeton (l'ancienne adresse cesse de répondre), pour le photographe connecté.
create or replace function public.rotate_calendar_token()
returns uuid language sql volatile security definer set search_path = public as $$
  update profiles set calendar_token = gen_random_uuid()
  where id = auth.uid() and role = 'photographer'
  returning calendar_token;
$$;
revoke execute on function public.rotate_calendar_token() from public, anon;
grant execute on function public.rotate_calendar_token() to authenticated;

-- Le contenu du flux, lu par /api/calendar/<jeton> avec la clé publishable : ouvert à anon exprès,
-- le jeton (122 bits aléatoires) fait office de mot de passe. Rien d'autre que les dates du photographe
-- qui le possède : ses rendez-vous et les jours de shooting de ses clients, sur un an glissant en arrière.
create or replace function public.calendar_feed(feed_token uuid)
returns table (uid text, title text, starts_at timestamptz, ends_at timestamptz, on_day date, location text)
language sql stable security definer set search_path = public as $$
  with owner as (
    select p.id from profiles p where p.calendar_token = feed_token and p.role = 'photographer'
  )
  select 'rdv-' || e.id, e.title || ' · ' || c.name, e.starts_at, e.ends_at, null::date, e.location
  from client_events e
  join clients c on c.id = e.client_id
  where e.photographer_id = (select id from owner)
    and e.starts_at > now() - interval '1 year'
  union all
  select 'shooting-' || c.id, coalesce(nullif(c.event_type, ''), 'Shooting') || ' · ' || c.name, null, null, c.event_date, null
  from clients c
  where c.photographer_id = (select id from owner)
    and c.event_date > (now() - interval '1 year')::date;
$$;
revoke execute on function public.calendar_feed(uuid) from public;
grant execute on function public.calendar_feed(uuid) to anon, authenticated;
