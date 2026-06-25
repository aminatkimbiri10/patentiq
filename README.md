# I2PA — Espace client PI

Plateforme d'assistance aux porteurs de projets en propriété intellectuelle — **I2PA** (International Intellectual Property Assistance), cabinet reconnu OMPIC.

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

Recherche de nouveauté : **EPO OPS** (brevets, gratuit) + **Hugging Face** (synthèse, gratuit). Voir [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md).

- **Assistant chat** : contexte dossier (documents, analyses, checklist, tâches, avis expert) via HF gratuit
- **OCR PDF scannés** : bouton « OCR local » dans Documents (Tesseract.js dans le navigateur, 0 €)
- **Rapports PDF** : bouton PDF → impression navigateur (Ctrl+P → Enregistrer en PDF)
- **Recherche** : `Ctrl+K` (barre du haut) · guide « Premiers pas » sur le tableau de bord

## Phase 2 — Surveillance, veille & valorisation

Migrations `00025_surveillance_claims.sql` + `00026_veille_commercialization.sql` + `00027_patent_drafts.sql` :

```bash
npm run db:push
```

- **Surveillance OMPIC** : `/dashboard/surveillance` · mode **`live`** = OMPIC + veille techno (Verdict I + J)
- **Antériorité / FTO** : onglet IA du dossier · EPO + OMPIC MA · voir `docs/VERDICT_J_VEILLE_FTO.md`
- **Rédaction & revendications** : Parcours PI (brevet) · export OMPIC · `docs/VERDICT_KL_REDACTION.md`
- **Veille techno** : mots-clés + scan EPO, cron hebdo GitHub Actions
- **Revendications** : Dossier → Revendications (brevet)
- **Rédaction brevet** : Dossier → Rédaction (sections OMPIC + **Suggérer brouillon IA**)
- **Cycle brevet** : Dossier → Cycle brevet (18 mois, directompic)
- **Échéances PI** : rappels opposition marque (2 mois) et publication brevet — tableau de bord + cron hebdo
- **Cycle marque** : Dossier → Cycle marque (marque)
- **Sécurité** : `/dashboard/security` (2FA TOTP + email confirmé)

Voir [docs/OMPIC_SURVEILLANCE.md](docs/OMPIC_SURVEILLANCE.md), [docs/N8N_OMPIC_SURVEILLANCE.md](docs/N8N_OMPIC_SURVEILLANCE.md) et le guide pas à pas [docs/N8N_GUIDE_ETAPE_PAR_ETAPE.md](docs/N8N_GUIDE_ETAPE_PAR_ETAPE.md).


```bash
npm run dev              # terminal 1
npm run ai:worker:loop   # terminal 2 — traite les analyses en attente
npm run db:push          # appliquer migrations (chat IA 00024)
```

Voir [docs/WORKER_AND_DEPLOY.md](docs/WORKER_AND_DEPLOY.md).

## Déploiement sans nom de domaine

Hébergement possible sur **Vercel** (sous-domaine gratuit `*.vercel.app`). Supabase cloud reste gratuit au quota free tier. Worker prod optionnel via GitHub Actions (gratuit). Aucun service payant requis pour la démo.

**Guide complet** : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

| Étape | Guide |
|-------|--------|
| 1. Code sur GitHub | [docs/GUIDE_GITHUB.md](docs/GUIDE_GITHUB.md) |
| 2. Déploiement Vercel | [docs/GUIDE_VERCEL.md](docs/GUIDE_VERCEL.md) |

```bash
npm run deploy:check   # vérifie les variables avant mise en ligne
```

## PWA (installable)

Sur mobile ou Chrome desktop : bannière **Installer PatentIQ** (gratuit, sans changement de tarif).  
Manuel : menu navigateur → *Installer l'application* / *Ajouter à l'écran d'accueil*.  
Nécessite HTTPS en production (ou `localhost` en dev).
