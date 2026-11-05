-- Alertes de sécurité Supabase sur le schéma de départ.

-- search_path figé : une fonction ne doit pas dépendre de celui de l'appelant.
alter function public.touch_updated_at() set search_path = '';

-- Les fonctions de trigger ne servent qu'aux triggers : personne ne doit pouvoir les appeler en RPC.
-- (Le droit EXECUTE n'est vérifié qu'à la création du trigger, pas quand il se déclenche.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_confirmed() from public, anon, authenticated;

-- Les fonctions d'accès des politiques RLS quittent le schéma exposé par l'API : elles restent
-- exécutables pendant l'évaluation des politiques, mais n'ont plus de point d'entrée /rest/v1/rpc.
-- Les politiques référencent les fonctions par identifiant et suivent le déplacement.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.is_client_of(uuid) set schema private;
alter function public.can_view_gallery(uuid) set schema private;
