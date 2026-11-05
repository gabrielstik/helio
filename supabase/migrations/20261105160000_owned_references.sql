-- Un photographe ne peut rattacher ses lignes qu'à SES clients et SES galeries.
-- Jusqu'ici les politiques « photographe » ne vérifiaient que photographer_id : en visant l'id d'un client
-- d'un autre studio, on faisait apparaître une facture ou une galerie dans l'espace de ce client.
-- (client_events est déjà corrigé par 20261105150000_calendar.sql.)

create or replace function private.owns_client(target_client uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from clients c where c.id = target_client and c.photographer_id = auth.uid());
$$;

create or replace function private.owns_gallery(target_gallery uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from galleries g where g.id = target_gallery and g.photographer_id = auth.uid());
$$;

drop policy "photographe" on public.documents;
create policy "photographe" on public.documents for all
  using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and private.owns_client(client_id));

drop policy "photographe" on public.client_notes;
create policy "photographe" on public.client_notes for all
  using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and private.owns_client(client_id));

drop policy "photographe" on public.galleries;
create policy "photographe" on public.galleries for all
  using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and (client_id is null or private.owns_client(client_id)));

drop policy "photographe" on public.photos;
create policy "photographe" on public.photos for all
  using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and private.owns_gallery(gallery_id));

drop policy "photographe" on public.products;
create policy "photographe" on public.products for all
  using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and (gallery_id is null or private.owns_gallery(gallery_id)));

-- clients.user_id (le compte du client) ne se pose que côté serveur, par link_client_account, une fois
-- l'adresse confirmée : un photographe qui l'écrivait lui-même pouvait ouvrir sa fiche à n'importe quel compte.
revoke insert, update on public.clients from authenticated;
grant insert (photographer_id, stage_id, position, name, email, phone, event_type, event_date, source, notes, newsletter_opt_in)
  on public.clients to authenticated;
grant update (stage_id, position, name, email, phone, event_type, event_date, source, notes, newsletter_opt_in)
  on public.clients to authenticated;
