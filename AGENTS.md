# Helio

SaaS pour photographes : un CRM en kanban et des galeries clients. Le cahier des charges est le doc
« Logiciel photos : fonctionnalités et user stories » (https://claude.ai/artifact/St5rxdsB2LbZ1tbnNwCpug).
Stack calquée sur SpeakCAD : Next.js (App Router, `src/proxy.ts`), Supabase (base, auth, stockage), Vercel, Resend, Stripe.

## Next.js 16

Cette version de Next.js a des changements incompatibles avec ce que vous connaissez peut-être
(`proxy.ts` au lieu de `middleware.ts`, `params` et `searchParams` asynchrones, types globaux
`PageProps` / `LayoutProps`). Lire `node_modules/next/dist/docs/` avant d'écrire du code.

## Rôles

- `photographer` (`/studio`) : paie l'abonnement, possède toutes les lignes portant son `photographer_id`.
- `client`, l'« administrateur » du cahier des charges (`/espace`) : le client du photographe, avec un compte relié par `clients.user_id`.
- invité (`/g/<slug>`) : pas de compte. Le serveur vérifie l'accès et lit avec la clé secrète.
- back-office (`/admin`) : e-mails de `ADMIN_EMAILS`.

Le rôle est fixé à l'inscription par le trigger `handle_new_user` (photographe par défaut) et ne se change
que côté serveur. Chaque espace vérifie le rôle dans son layout (`requireRole`, `src/lib/auth.ts`).

## Interface

Astryx (`@astryxdesign/core`, le design system de SpeakCAD) avec le thème `src/theme/photos.theme.ts`, compilé
par `npm run theme:build` : ne pas éditer `photos.css`, `photos.js` ni les `.d.ts` générés. Avant d'utiliser un
composant, lire ses props (`npx astryx component <Nom>`) ; les modèles de pages : `npx astryx template --list`.
Pas de `stylex.create` (aucun compilateur StyleX) : la mise en page sur mesure passe par les classes `lp-*` de
`src/app/globals.css`, avec les tokens (`var(--spacing-*)`, `var(--color-*)`). Icônes : lucide-react.

## Base

Les migrations sont dans `supabase/migrations/`. La RLS est active sur toutes les tables : toute nouvelle
table doit avoir ses politiques dans la même migration.
