-- Schéma de départ : photographes, CRM (kanban), documents, galeries et photos.
--
-- Trois rôles côté produit :
--   photographer  celui qui paie l'abonnement ; possède tout ce qu'il crée (photographer_id = auth.uid()).
--   client        « administrateur » de sa galerie : le client du photographe, avec un compte (clients.user_id).
--   invité        pas de compte : accès à une galerie par lien, QR code ou mot de passe. Il ne lit jamais
--                 les tables directement ; le serveur vérifie l'accès puis lit avec la clé secrète.
-- Le back-office (/admin) est réservé aux e-mails de ADMIN_EMAILS, hors base.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('photographer', 'client');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'photographer',
  full_name text,
  studio_name text,
  -- Personnalisation visuelle des galeries (logo, couleurs, police).
  branding jsonb not null default '{}'::jsonb,
  stripe_customer_id text unique,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CRM : colonnes du kanban et cartes clients
-- ---------------------------------------------------------------------------

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  position int not null,
  -- Une carte posée dans cette colonne rend ses galeries visibles (colonne « Terminé »).
  unlocks_gallery boolean not null default false,
  created_at timestamptz not null default now(),
  unique (photographer_id, position) deferrable initially deferred
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  stage_id uuid references public.pipeline_stages (id) on delete set null,
  -- Ordre de la carte dans sa colonne.
  position double precision not null default 0,
  -- Compte du client une fois invité dans son espace.
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text,
  phone text,
  event_type text,
  event_date date,
  -- « formulaire de contact », « e-mail », « manuel »…
  source text not null default 'manual',
  notes text,
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clients_photographer_stage_idx on public.clients (photographer_id, stage_id, position);
create index clients_user_idx on public.clients (user_id);

-- Rendez-vous et dates clés visibles dans l'espace client.
create table public.client_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  location text,
  created_at timestamptz not null default now()
);

-- Notes partagées entre le client et le photographe (le photographe est notifié).
create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Devis, contrats et factures. La facturation électronique reste une question ouverte.
create type public.document_kind as enum ('quote', 'contract', 'invoice');
create type public.document_status as enum ('draft', 'sent', 'signed', 'paid', 'void');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  kind public.document_kind not null,
  status public.document_status not null default 'draft',
  number text,
  amount_cents int,
  currency text not null default 'eur',
  storage_path text,
  stripe_checkout_session_id text,
  sent_at timestamptz,
  signed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index documents_client_idx on public.documents (client_id);

-- ---------------------------------------------------------------------------
-- Galeries
-- ---------------------------------------------------------------------------

create type public.gallery_status as enum ('draft', 'published', 'archived');

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  title text not null,
  -- Adresse publique : /g/<slug>.
  slug text not null unique,
  status public.gallery_status not null default 'draft',
  -- Accès invité : lien seul, ou lien + mot de passe (haché par le serveur).
  access_password_hash text,
  allow_downloads boolean not null default true,
  face_search_enabled boolean not null default false,
  theme jsonb not null default '{}'::jsonb,
  cover_photo_id uuid,
  -- Galerie importée depuis un autre service (Pixieset, Pic-Time…).
  imported_from text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index galleries_photographer_idx on public.galleries (photographer_id);
create index galleries_client_idx on public.galleries (client_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  -- Chemin dans le bucket privé « photos » : <photographer_id>/<gallery_id>/<fichier>.
  storage_path text not null,
  filename text not null,
  width int,
  height int,
  size_bytes bigint,
  position double precision not null default 0,
  taken_at timestamptz,
  created_at timestamptz not null default now()
);
create index photos_gallery_position_idx on public.photos (gallery_id, position);

alter table public.galleries
  add constraint galleries_cover_photo_fk foreign key (cover_photo_id) references public.photos (id) on delete set null;

-- Favoris et photos masquées, choisis par le client.
create table public.photo_preferences (
  photo_id uuid not null references public.photos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  favorite boolean not null default false,
  hidden boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (photo_id, user_id)
);

-- Produits vendus depuis une galerie (albums…) et leurs commandes. Un invité doit s'identifier pour payer.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  gallery_id uuid references public.galleries (id) on delete cascade,
  name text not null,
  description text,
  price_cents int not null,
  currency text not null default 'eur',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  gallery_id uuid references public.galleries (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  buyer_email text not null,
  buyer_user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'pending',
  amount_cents int not null,
  currency text not null default 'eur',
  -- Photos choisies pour l'album.
  photo_ids uuid[] not null default '{}',
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Fonctions d'accès (security definer : évitent la récursion des politiques RLS)
-- ---------------------------------------------------------------------------

create or replace function public.is_client_of(target_client uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from clients c where c.id = target_client and c.user_id = auth.uid());
$$;

-- Le client voit une galerie publiée qui lui est rattachée, une fois sa carte dans une colonne qui la débloque.
create or replace function public.can_view_gallery(target_gallery uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from galleries g
    join clients c on c.id = g.client_id
    left join pipeline_stages s on s.id = c.stage_id
    where g.id = target_gallery
      and c.user_id = auth.uid()
      and g.status = 'published'
      and coalesce(s.unlocks_gallery, false)
  );
$$;

-- ---------------------------------------------------------------------------
-- Inscription : profil + colonnes par défaut du kanban
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_role app_role := case when new.raw_user_meta_data ->> 'role' = 'client' then 'client'::app_role else 'photographer'::app_role end;
begin
  insert into profiles (id, role, full_name)
  values (new.id, new_role, new.raw_user_meta_data ->> 'full_name');

  if new_role = 'photographer' then
    insert into pipeline_stages (photographer_id, name, position, unlocks_gallery) values
      (new.id, 'Prospects', 0, false),
      (new.id, 'Attente de contrat', 1, false),
      (new.id, 'Contrat signé', 2, false),
      (new.id, 'Acompte reçu', 3, false),
      (new.id, 'Shooting réalisé', 4, false),
      (new.id, 'Terminé', 5, true);
  elsif new.email_confirmed_at is not null then
    perform link_client_account(new.id, new.email);
  end if;
  return new;
end;
$$;

-- Un client invité par e-mail : sa carte est rattachée à son compte, seulement une fois l'adresse
-- confirmée (sinon une inscription non vérifiée pourrait prendre la place du vrai client).
create or replace function public.link_client_account(account uuid, account_email text)
returns void language sql security definer set search_path = public as $$
  update clients set user_id = account
  where user_id is null and lower(email) = lower(account_email)
    and exists (select 1 from profiles p where p.id = account and p.role = 'client');
$$;
revoke execute on function public.link_client_account(uuid, text) from public, anon, authenticated;

create or replace function public.handle_user_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform link_client_account(new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_user_confirmed();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.clients enable row level security;
alter table public.client_events enable row level security;
alter table public.client_notes enable row level security;
alter table public.documents enable row level security;
alter table public.galleries enable row level security;
alter table public.photos enable row level security;
alter table public.photo_preferences enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Le rôle, l'offre et le client Stripe ne changent que côté serveur (clé secrète).
create policy "profil : lecture" on public.profiles for select using (id = auth.uid());
create policy "profil : modification" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name, studio_name, branding) on public.profiles to authenticated;

-- Le photographe possède tout ce qui porte son photographer_id.
create policy "photographe" on public.pipeline_stages for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.clients for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.client_events for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.client_notes for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.documents for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.galleries for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.photos for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe" on public.products for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "photographe : lecture" on public.orders for select using (photographer_id = auth.uid());

-- Le client (administrateur de sa galerie) lit son espace.
create policy "client : sa fiche" on public.clients for select using (user_id = auth.uid());
create policy "client : ses dates" on public.client_events for select using (public.is_client_of(client_id));
create policy "client : ses notes" on public.client_notes for select using (public.is_client_of(client_id));
create policy "client : écrire une note" on public.client_notes for insert
  with check (author_id = auth.uid() and public.is_client_of(client_id)
    and photographer_id = (select c.photographer_id from public.clients c where c.id = client_id));
create policy "client : ses documents" on public.documents for select using (status <> 'draft' and public.is_client_of(client_id));
create policy "client : ses galeries" on public.galleries for select using (public.can_view_gallery(id));
create policy "client : ses photos" on public.photos for select using (public.can_view_gallery(gallery_id));
create policy "client : favoris et masquées" on public.photo_preferences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.photos p where p.id = photo_id and public.can_view_gallery(p.gallery_id)));
create policy "client : ses commandes" on public.orders for select using (buyer_user_id = auth.uid());
create policy "client : produits" on public.products for select using (active and gallery_id is not null and public.can_view_gallery(gallery_id));

-- ---------------------------------------------------------------------------
-- Stockage : bucket privé, un dossier par photographe
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "photos : le photographe gère son dossier" on storage.objects for all
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
