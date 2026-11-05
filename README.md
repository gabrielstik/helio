# Helio

CRM en kanban et galeries clients pour photographes. Voir `AGENTS.md` pour l'architecture et les rôles.

## Démarrer en local

Prérequis : Node 22 et un projet Supabase hébergé (pas de Supabase local). Les migrations de
`supabase/migrations/` s'appliquent sur ce projet.

```bash
npm install
cp .env.example .env.local   # puis y coller l'URL, la clé publishable et la clé secrète du projet
npm run dev
```

L'app tourne sur http://localhost:3000. La connexion se fait par e-mail et mot de passe ; les comptes se
créent pour l'instant dans le dashboard Supabase (Authentication → Users → Add user, en cochant « Auto
Confirm User »). Un nouveau compte est photographe ; ses colonnes de kanban sont créées automatiquement.

## Espaces

| Chemin | Qui | Contenu |
| --- | --- | --- |
| `/studio/crm` | Photographe | Kanban des clients |
| `/studio/galeries` | Photographe | Galeries |
| `/espace` | Client | Devis, contrat, factures, galeries |
| `/g/<slug>` | Invité | Galerie publiée |
| `/admin` | `ADMIN_EMAILS` | Back-office |

## Pas encore fait

Aucun compte Vercel, Stripe ou Resend n'est créé et rien n'est déployé.
