# Logiciel photos

CRM en kanban et galeries clients pour photographes. Voir `AGENTS.md` pour l'architecture et les rôles.

## Démarrer en local

Prérequis : Node 22 et Docker (pour Supabase en local).

```bash
npm install
npm run db:start        # Supabase local ; affiche l'URL et les clés
cp .env.example .env.local   # puis y coller l'URL, la clé publishable et la clé secrète
npm run db:reset        # applique supabase/migrations
npm run dev
```

L'app tourne sur http://localhost:3000. Les e-mails de connexion locaux arrivent dans Mailpit
(http://127.0.0.1:54324). Le premier compte créé est un photographe ; ses colonnes de kanban sont créées
automatiquement.

## Espaces

| Chemin | Qui | Contenu |
| --- | --- | --- |
| `/studio/crm` | Photographe | Kanban des clients |
| `/studio/galeries` | Photographe | Galeries |
| `/espace` | Client | Devis, contrat, factures, galeries |
| `/g/<slug>` | Invité | Galerie publiée |
| `/admin` | `ADMIN_EMAILS` | Back-office |

## Pas encore fait

Aucun compte Supabase, Vercel, Stripe ou Resend n'est créé et rien n'est déployé.
