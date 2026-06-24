# Hébergement & déploiement PatentIQ

Guide pas à pas pour mettre l’application en ligne **gratuitement** (GitHub + Vercel + Supabase Cloud + GitHub Actions).

## Guides pas à pas

| Étape | Document |
|-------|----------|
| **1. Publier le code sur GitHub** | [GUIDE_GITHUB.md](GUIDE_GITHUB.md) |
| **2. Déployer sur Vercel** | [GUIDE_VERCEL.md](GUIDE_VERCEL.md) |
| **3. Base de données Supabase** | §1 ci-dessous + [SUPABASE_SETUP.md](SUPABASE_SETUP.md) |
| **4. Workers (IA + surveillance)** | §4 ci-dessous + [WORKER_AND_DEPLOY.md](WORKER_AND_DEPLOY.md) |

**Architecture cible**

```
Navigateur ──HTTPS──► Vercel (Next.js 14)
                          │
                          ├──► Supabase (Auth, Postgres, Storage)
                          ├──► Hugging Face (IA)
                          ├──► EPO OPS (brevets MA)
                          └──► search.ompic.ma (marques, mode live)

GitHub Actions (cron) ──POST──► /api/ai/worker
                              └──► /api/surveillance/worker
```

---

## 0. Prérequis

| Outil | Rôle |
|-------|------|
| [GitHub](https://github.com) | Code source (`aminatkimbiri10/patentiq`) |
| [Supabase](https://supabase.com) | Base de données, auth, fichiers |
| [Vercel](https://vercel.com) | Hébergement Next.js (HTTPS gratuit) |
| Node.js 18+ | Build local de vérification |

Vérifier le build local :

```bash
npm install
npm run build
node scripts/deploy-preflight.mjs   # après avoir rempli .env.local
```

---

## 1. Supabase Cloud

### 1.1 Créer le projet

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Région : **Europe (Frankfurt)** ou proche du Maroc
3. Noter :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement)

### 1.2 Appliquer les migrations

```bash
npm install -g supabase   # si pas installé
supabase login
supabase link --project-ref <votre-project-ref>
npm run db:push
```

> **Project ref** : Settings → General → Reference ID (ex. `abcdefghijklmnop`).

Alternative : exécuter manuellement les fichiers `supabase/migrations/00001_*.sql` … `00032_*.sql` dans le **SQL Editor** (ordre numérique).

### 1.3 Storage

Les buckets `project-documents` et `avatars` sont créés par la migration `00017`. Vérifier dans **Storage** qu’ils existent.

### 1.4 Premier admin (optionnel)

Après votre première inscription, exécuter dans SQL Editor (remplacer l’UUID) — voir [SUPABASE_SETUP.md](SUPABASE_SETUP.md) §6.

---

## 2. Vercel — déployer l’application

### 2.1 Importer le repo

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Choisir `aminatkimbiri10/patentiq`
3. Framework : **Next.js** (détecté automatiquement)
4. **Ne pas** modifier Build Command (`next build`) ni Output Directory

### 2.2 Variables d’environnement

Dans **Settings → Environment Variables**, ajouter **toutes** les lignes ci-dessous pour **Production** (et Preview si vous testez des PR).

| Variable | Obligatoire | Exemple / note |
|----------|-------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | clé anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | clé service_role |
| `NEXT_PUBLIC_APP_URL` | Oui | `https://patentiq.vercel.app` (URL Vercel finale) |
| `AI_WORKER_SECRET` | Oui | chaîne longue aléatoire (ex. `openssl rand -hex 32`) |
| `OMPIC_SEARCH_MODE` | Recommandé | `hybrid` (démo fiable) ou `live` |
| `HUGGINGFACE_API_KEY` | Recommandé | `hf_...` |
| `EPO_OPS_CONSUMER_KEY` | Brevets MA | clé EPO OPS |
| `EPO_OPS_CONSUMER_SECRET` | Brevets MA | secret EPO OPS |
| `RESEND_API_KEY` | Optionnel | emails transactionnels |
| `EMAIL_FROM` | Optionnel | `PatentIQ <noreply@votredomaine.com>` |
| `OMPIC_PROXY_URL` | Optionnel | webhook n8n si portail OMPIC lent |
| `OMPIC_PROXY_TOKEN` | Optionnel | token n8n |

> **Important** : `NEXT_PUBLIC_APP_URL` doit être l’URL **exacte** Vercel (avec `https://`), pas `localhost`.

### 2.3 Déployer

Cliquer **Deploy**. La première URL ressemble à :

`https://patentiq-xxxxx.vercel.app`

Renommer le projet en **patentiq** dans Vercel (Settings → Project Name) pour obtenir :

`https://patentiq.vercel.app`

Puis **mettre à jour** `NEXT_PUBLIC_APP_URL` avec cette URL et **redéployer** (Deployments → … → Redeploy).

### 2.4 Région serveur

`vercel.json` fixe la région **`cdg1` (Paris)** pour réduire la latence vers le Maroc. Sur le plan Hobby, Vercel peut ignorer certaines options avancées ; l’app fonctionne quand même.

### 2.5 Limite de durée (OMPIC live)

Les recherches OMPIC peuvent prendre **jusqu’à 30 s**. Sur Vercel **Hobby**, les fonctions serverless sont limitées à **10 s** :

- En démo / soutenance : `OMPIC_SEARCH_MODE=hybrid` ou `stub`
- Pour OMPIC live fiable : plan **Pro** (60 s) ou proxy **n8n** (`OMPIC_PROXY_URL`)

---

## 3. Supabase Auth — URLs de production

Dashboard Supabase → **Authentication** → **URL Configuration** :

| Champ | Valeur |
|-------|--------|
| **Site URL** | `https://patentiq.vercel.app` |
| **Redirect URLs** | `https://patentiq.vercel.app/auth/callback` |
| | `https://patentiq.vercel.app/auth/reset-password` |
| | `https://patentiq.vercel.app/onboarding/role` |

### Email en production

- **Démo / stage** : désactiver « Confirm email » (Providers → Email) pour inscription immédiate
- **Production réelle** : activer la confirmation + SMTP (Resend) dans Supabase → Project Settings → Authentication → SMTP

---

## 4. Workers (IA + surveillance)

Sans worker, les analyses IA restent en `pending`. Deux options gratuites :

### Option A — GitHub Actions (recommandé, gratuit)

Repo GitHub → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|--------|--------|
| `APP_URL` | `https://patentiq.vercel.app` |
| `AI_WORKER_SECRET` | même valeur que sur Vercel |

Workflows déjà présents :

- `.github/workflows/ai-worker.yml` — toutes les **5 min**
- `.github/workflows/surveillance-scan.yml` — **lundis 06:00 UTC**

Tester manuellement : **Actions** → workflow → **Run workflow**.

### Option B — Local (développement)

```bash
npm run ai:worker:loop
```

### Vérifier le worker

```bash
curl -sS https://patentiq.vercel.app/api/health | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d),null,2)))"
```

Champs utiles : `checks.supabase.ok`, `checks.aiWorker.stale`, `checks.config.llm`.

---

## 5. Checklist post-déploiement

- [ ] Page d’accueil charge en HTTPS
- [ ] Inscription + connexion fonctionnent
- [ ] Création d’un projet PI
- [ ] Upload document (Storage Supabase)
- [ ] Recherche IA ou surveillance (selon clés configurées)
- [ ] `/api/health` → `ok: true`
- [ ] Bandeau Surveillance affiche le bon mode OMPIC
- [ ] PWA : « Installer PatentIQ » visible sur mobile (HTTPS requis)

---

## 6. Domaine personnalisé (optionnel)

Vercel → **Settings → Domains** → ajouter `app.i2pa.ma` (exemple).

Mettre à jour :

- `NEXT_PUBLIC_APP_URL`
- Redirect URLs Supabase
- Secret `APP_URL` GitHub Actions

---

## 7. Mises à jour continues

Chaque `git push` sur `main` déclenche un redéploiement Vercel automatique.

Nouvelles migrations :

```bash
supabase db push
# puis redéployer si changement de code
```

---

## 8. Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Connexion impossible | Redirect URL manquante | Supabase Auth URLs §3 |
| `Email not confirmed` | Confirmation activée | Désactiver ou configurer SMTP |
| Analyses IA bloquées en pending | Worker inactif | Secrets GitHub `APP_URL` + `AI_WORKER_SECRET` |
| OMPIC timeout sur Vercel | Limite 10 s Hobby | `hybrid` ou n8n proxy |
| Upload échoue | RLS / bucket | Vérifier migrations 00017–00018 |
| 500 au login | `SUPABASE_SERVICE_ROLE_KEY` absente sur Vercel | Ajouter la variable |

---

## 9. Coûts (démo / stage)

| Service | Tier gratuit |
|---------|----------------|
| Vercel Hobby | Oui (`*.vercel.app`) |
| Supabase Free | Oui (quota DB / auth) |
| Hugging Face | Oui (quota API) |
| GitHub Actions | Oui (minutes incluses) |
| EPO OPS | Gratuit avec inscription |

Aucun domaine payant requis pour la soutenance.

---

Voir aussi : [WORKER_AND_DEPLOY.md](WORKER_AND_DEPLOY.md), [SUPABASE_SETUP.md](SUPABASE_SETUP.md), [OMPIC_SURVEILLANCE.md](OMPIC_SURVEILLANCE.md).
