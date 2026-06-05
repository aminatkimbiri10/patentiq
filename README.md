# PatentIQ — Plateforme PI

Plateforme d'assistance aux porteurs de projets en propriété intellectuelle (Next.js 14 + Supabase).

## Stack

- Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- Supabase Auth, PostgreSQL (RLS), Storage
- React Hook Form + Zod, TanStack Query, Zustand (UI)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

Copier `.env.example` vers `.env.local` (déjà configuré si présent).

### Base de données

```bash
supabase db push
# puis seed.sql ou supabase db reset (local)
```

Voir [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Structure

- `src/app` — routes (public, auth, dashboard, admin, cpi, expert)
- `src/lib/supabase` — clients browser / server / middleware
- `src/lib/auth` — session, rôles, guards
- `supabase/migrations` — schéma SQL + RLS + Storage

## Rôles

| Rôle | Home |
|------|------|
| project_holder | `/dashboard` |
| cpi_advisor | `/cpi` |
| expert | `/expert` |
| admin | `/admin` |

## IA

Recherche de nouveauté : **EPO OPS** (brevets, gratuit) + **Gemini** (synthèse, gratuit). Voir [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md).
