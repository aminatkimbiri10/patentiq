# Worker IA & déploiement gratuit (sans domaine)

> **Guide complet hébergement** : [DEPLOYMENT.md](DEPLOYMENT.md) (Supabase + Vercel + Auth + checklist).

## Migration chat IA (`00024`)

Si le chat assistant ne persiste pas les messages :

```bash
npm run db:push
# ou : supabase db push
```

## Worker IA en local (gratuit)

Les analyses passent par `pending` → `processing` → `completed`. Deux terminaux :

```bash
# Terminal 1
npm run dev

# Terminal 2 — boucle toutes les 12 s
npm run ai:worker:loop
```

Traitement ponctuel :

```bash
npm run ai:worker
```

### Variables `.env.local`

```env
AI_WORKER_SECRET=une-chaine-secrete-longue
HUGGINGFACE_API_KEY=hf_...
```

Sans `AI_WORKER_SECRET`, l'API traite les analyses **en inline** (fallback automatique).

## Déploiement Vercel (sous-domaine gratuit)

1. Compte [vercel.com](https://vercel.com) + repo GitHub
2. Import projet → Framework Next.js
3. Variables d'environnement (mêmes que `.env.local` + `NEXT_PUBLIC_SUPABASE_*`)
4. URL fournie : `https://votre-projet.vercel.app` — **pas de domaine custom requis**

### Worker en production

Option A — **Cron Vercel** (plan Pro) : appeler `POST /api/ai/worker` avec `Authorization: Bearer <AI_WORKER_SECRET>`.

Option B — **GitHub Actions** (gratuit, toutes les 5 min) :

```yaml
# .github/workflows/ai-worker.yml
on:
  schedule:
    - cron: "*/5 * * * *"
  workflow_dispatch:
jobs:
  worker:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sS -X POST "${{ secrets.APP_URL }}/api/ai/worker" \
            -H "Authorization: Bearer ${{ secrets.AI_WORKER_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"limit":5}'
```

Secrets GitHub : `APP_URL` (ex. `https://patentiq.vercel.app`), `AI_WORKER_SECRET`.

## Worker surveillance (hebdomadaire)

Scan watchlist OMPIC + veille technologique :

```bash
curl -sS -X POST "${APP_URL}/api/surveillance/worker" \
  -H "Authorization: Bearer ${AI_WORKER_SECRET}"
```

GitHub Actions : `.github/workflows/surveillance-scan.yml` (lundis 06:00 UTC).  
Variables : `OMPIC_SEARCH_MODE`, `OMPIC_PROXY_URL` — voir [docs/OMPIC_SURVEILLANCE.md](OMPIC_SURVEILLANCE.md).

## OCR PDF (navigateur)

Le bouton **OCR local** utilise Tesseract + PDF.js dans le navigateur.  
Un seul chargement PDF par document (évite l'erreur *detached ArrayBuffer*).
