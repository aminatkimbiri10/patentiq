# Guide — Déployer PatentIQ sur Vercel

Ce guide explique comment **mettre l’application en ligne** sur Vercel après avoir publié le code sur GitHub.

> **Prérequis** : code sur GitHub ([GUIDE_GITHUB.md](GUIDE_GITHUB.md)) + projet **Supabase** configuré ([DEPLOYMENT.md](DEPLOYMENT.md) §1)

---

## 1. Ce que fait Vercel

Vercel **build** et **héberge** votre app Next.js :

```text
git push sur main  →  Vercel build (npm run build)  →  URL HTTPS gratuite
```

Exemple d’URL finale : `https://patentiq.vercel.app`

---

## 2. Créer un compte Vercel

1. Aller sur [vercel.com/signup](https://vercel.com/signup)
2. Choisir **Continue with GitHub**
3. Autoriser Vercel à accéder à vos dépôts

---

## 3. Importer le projet GitHub

1. [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → sélectionner `aminatkimbiri10/patentiq`
3. Si le repo n’apparaît pas : **Adjust GitHub App Permissions** → autoriser le dépôt

### Paramètres de build (laisser par défaut)

| Champ | Valeur |
|-------|--------|
| Framework Preset | **Next.js** |
| Root Directory | `./` |
| Build Command | `next build` |
| Output Directory | *(vide — auto)* |
| Install Command | `npm install` |

**Ne cliquez pas encore sur Deploy** — ajoutez d’abord les variables d’environnement.

---

## 4. Variables d’environnement (obligatoire)

Dans la section **Environment Variables**, ajoutez chaque ligne pour **Production** (cochez aussi **Preview** si vous voulez tester les PR).

Copiez les valeurs depuis votre `.env.local` local (jamais depuis GitHub).

### 4.1 Obligatoires

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur (secrète) | `eyJhbGci...` |
| `AI_WORKER_SECRET` | Secret workers / cron | chaîne longue aléatoire |
| `NEXT_PUBLIC_APP_URL` | URL Vercel finale | voir §5 |

### 4.2 Recommandées (fonctionnalités complètes)

| Variable | Rôle |
|----------|------|
| `HUGGINGFACE_API_KEY` | IA (chat, brouillons, analyses) |
| `OMPIC_SEARCH_MODE` | `hybrid` (démo fiable) ou `live` |
| `EPO_OPS_CONSUMER_KEY` | Brevets marocains via EPO |
| `EPO_OPS_CONSUMER_SECRET` | Secret EPO OPS |

### 4.3 Optionnelles

| Variable | Rôle |
|----------|------|
| `RESEND_API_KEY` | Emails transactionnels |
| `EMAIL_FROM` | `PatentIQ <noreply@domaine.com>` |
| `OMPIC_PROXY_URL` | Webhook n8n si OMPIC lent |
| `OMPIC_PROXY_TOKEN` | Token n8n |

### Générer un secret worker

PowerShell :

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Ou en ligne : [randomkeygen.com](https://randomkeygen.com) (section « CodeIgniter »).

---

## 5. Premier déploiement

1. Cliquez **Deploy**
2. Attendez 2–5 minutes (build Next.js)
3. Vercel affiche une URL du type :

```text
https://patentiq-xxxxx.vercel.app
```

### Renommer pour une URL propre

1. **Project Settings** → **General** → **Project Name** → `patentiq`
2. URL stable : `https://patentiq.vercel.app`

### Mettre à jour `NEXT_PUBLIC_APP_URL`

1. **Settings** → **Environment Variables**
2. Modifier `NEXT_PUBLIC_APP_URL` → `https://patentiq.vercel.app`
3. **Deployments** → dernier déploiement → **⋯** → **Redeploy**

> Cette variable sert aux liens email, callbacks auth et workers.

---

## 6. Configurer Supabase pour la prod

Dashboard Supabase → **Authentication** → **URL Configuration** :

| Champ | Valeur |
|-------|--------|
| **Site URL** | `https://patentiq.vercel.app` |
| **Redirect URLs** | `https://patentiq.vercel.app/auth/callback` |
| | `https://patentiq.vercel.app/auth/reset-password` |
| | `https://patentiq.vercel.app/onboarding/role` |

### Email (démo / soutenance)

**Authentication** → **Providers** → **Email** → désactiver **Confirm email**  
→ inscription et connexion immédiates sans mail.

### Email (production réelle)

Réactiver la confirmation + configurer SMTP (Resend) dans Supabase.

---

## 7. Workers GitHub Actions

Sans worker, les analyses IA restent en file d’attente (`pending`).

Sur GitHub : repo → **Settings** → **Secrets and variables** → **Actions** :

| Secret | Valeur |
|--------|--------|
| `APP_URL` | `https://patentiq.vercel.app` |
| `AI_WORKER_SECRET` | **identique** à Vercel |

### Tester

1. GitHub → **Actions**
2. Workflow **AI Worker** → **Run workflow**
3. Vérifier que le job est vert ✓

Workflows inclus :

- **AI Worker** — toutes les 5 minutes
- **Surveillance Worker** — lundis 06:00 UTC

---

## 8. Vérifier que tout fonctionne

### 8.1 Santé de l’application

Ouvrir dans le navigateur :

```text
https://patentiq.vercel.app/api/health
```

Réponse attendue (extrait) :

```json
{
  "ok": true,
  "checks": {
    "supabase": { "ok": true },
    "config": { "llm": true, "workerSecret": true }
  }
}
```

### 8.2 Checklist manuelle

- [ ] Page d’accueil charge (HTTPS, cadenas vert)
- [ ] Inscription + connexion
- [ ] Création d’un projet
- [ ] Upload d’un document PDF
- [ ] Page Surveillance (bandeau mode OMPIC)
- [ ] PWA : option « Installer » sur mobile

### 8.3 Pré-vol local (avant chaque grosse mise à jour)

```powershell
cd C:\Users\DELL\patent
npm run build
npm run deploy:check
```

(`deploy:check` échoue tant que `NEXT_PUBLIC_APP_URL` = localhost — normal en local.)

---

## 9. Mises à jour (workflow quotidien)

Chaque `git push` sur `main` redéploie automatiquement :

```powershell
git add .
git commit -m "fix: correction surveillance"
git push origin main
```

Suivre le build : Vercel → **Deployments** → statut **Ready**.

Nouvelles migrations Supabase :

```powershell
npm run db:push
```

(pas besoin de redéployer Vercel pour les seules migrations DB)

---

## 10. Fichier `vercel.json` (déjà dans le repo)

Le projet inclut :

```json
{
  "framework": "nextjs",
  "regions": ["cdg1"]
}
```

- **cdg1** = Paris (latence réduite vers le Maroc)
- Pas de domaine personnalisé requis

---

## 11. Limite importante — OMPIC sur plan gratuit

| Plan Vercel | Timeout fonction serverless |
|-------------|----------------------------|
| **Hobby** (gratuit) | **10 secondes** max |
| **Pro** | jusqu’à 60 secondes |

Les recherches OMPIC live peuvent prendre **30 s**.

**Recommandation plan gratuit** :

```env
OMPIC_SEARCH_MODE=hybrid
```

→ essaie le portail réel, bascule sur le catalogue stub si timeout.

Alternative : proxy **n8n** (`OMPIC_PROXY_URL`) — voir [N8N_OMPIC_SURVEILLANCE.md](N8N_OMPIC_SURVEILLANCE.md).

---

## 12. Domaine personnalisé (optionnel)

Vercel → **Settings** → **Domains** → ajouter ex. `app.i2pa.ma`

Puis mettre à jour :

- `NEXT_PUBLIC_APP_URL` sur Vercel
- Redirect URLs Supabase
- Secret `APP_URL` GitHub Actions

---

## 13. Dépannage Vercel

| Symptôme | Cause | Action |
|----------|-------|--------|
| Build failed | Erreur TypeScript / lint | `npm run build` en local, corriger |
| 500 à l’ouverture | Variable manquante | Vérifier les 5 variables obligatoires §4.1 |
| Connexion impossible | Redirect URL | §6 Supabase Auth |
| `Email not confirmed` | Confirmation activée | Désactiver ou SMTP |
| Analyses IA bloquées | Worker inactif | Secrets GitHub §7 |
| OMPIC timeout | Limite 10 s Hobby | `hybrid` ou n8n |
| Upload fichier échoue | Storage / RLS | `npm run db:push`, migrations 00017–00018 |

Logs détaillés : Vercel → **Deployments** → clic sur le déploiement → **Building** / **Functions** / **Runtime Logs**.

---

## 14. Coûts

| Service | Gratuit pour la démo |
|---------|----------------------|
| Vercel Hobby | ✓ `*.vercel.app` |
| Supabase Free | ✓ (quotas) |
| GitHub Actions | ✓ |
| Hugging Face | ✓ (quota API) |

Aucun paiement requis pour la soutenance.

---

## Récapitulatif en 10 étapes

1. Compte Vercel + lien GitHub  
2. Import `patentiq`  
3. Variables d’environnement (§4)  
4. Deploy  
5. Renommer projet → `patentiq.vercel.app`  
6. Mettre à jour `NEXT_PUBLIC_APP_URL` + Redeploy  
7. Supabase Auth URLs (§6)  
8. Secrets GitHub Actions (§7)  
9. Tester `/api/health`  
10. Tester inscription + un parcours complet  

---

Voir aussi : [GUIDE_GITHUB.md](GUIDE_GITHUB.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [WORKER_AND_DEPLOY.md](WORKER_AND_DEPLOY.md)
