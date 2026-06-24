# Guide n8n — étape par étape (surveillance OMPIC)

Ce guide te mène de **zéro** à un scan OMPIC fonctionnel via n8n + PatentIQ.  
Durée estimée : **30–45 min** (première fois).

---

## Vue d’ensemble

| Étape | Où | Quoi |
|-------|-----|------|
| 1 | n8n | Créer un compte / installer n8n |
| 2 | n8n | Importer le workflow stub |
| 3 | n8n | Activer + copier l’URL webhook |
| 4 | n8n | Définir le token secret |
| 5 | PatentIQ | Configurer `.env.local` |
| 6 | PatentIQ | Migration BDD + redémarrer l’app |
| 7 | Test | curl → PatentIQ → alertes |
| 8 | (opt.) | Cron hebdo automatique |

---

## Étape 1 — Avoir une instance n8n

Choisis **une** option :

### Option A — n8n Cloud (le plus simple, recommandé)

1. Va sur [https://n8n.io](https://n8n.io) → **Get started free**
2. Crée un compte
3. Tu arrives sur l’éditeur : `https://TON-NOM.app.n8n.cloud`

> Plan gratuit limité en exécutions — suffisant pour la démo stage.

### Option B — n8n en local (Docker sur Windows)

Prérequis : [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé.

PowerShell :

```powershell
docker volume create n8n_data
docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

Ouvre [http://localhost:5678](http://localhost:5678) et crée ton compte local.

> En local, l’URL webhook ne sera accessible que depuis ta machine (`localhost`). Pour que PatentIQ sur Vercel appelle n8n, il faudra **n8n Cloud** ou un tunnel (ngrok) — pour commencer, teste tout en **local** (`npm run dev` + n8n local).

---

## Étape 2 — Importer le workflow PatentIQ

1. Dans n8n, menu **⋯** (en haut à droite) → **Import from file**
2. Sélectionne le fichier du projet :

   ```
   C:\Users\DELL\patent\docs\n8n\ompic-proxy-stub-workflow.json
   ```

3. Le workflow **« PatentIQ — OMPIC Search Proxy (stub) »** apparaît avec 3 nodes :
   - Webhook POST /search
   - Catalogue stub + similarité
   - Respond JSON

4. **Ne l’active pas encore** — on configure d’abord le token (étape 4).

---

## Étape 3 — Comprendre l’URL webhook

1. Clique sur le node **« Webhook POST /search »**
2. Note le **Path** : `ompic-search`
3. Deux URLs possibles dans n8n :

| Mode | URL (exemple n8n Cloud) |
|------|-------------------------|
| **Test** (workflow inactif, bouton *Test workflow*) | `https://TON-NOM.app.n8n.cloud/webhook-test/ompic-search` |
| **Production** (workflow **activé**) | `https://TON-NOM.app.n8n.cloud/webhook/ompic-search` |

**Important :** PatentIQ utilise l’URL **complète** telle quelle (sans ajouter `/search` à la fin).  
Tu colleras exactement l’URL copiée depuis n8n dans `OMPIC_PROXY_URL`.

Pour copier l’URL :
- Node Webhook → onglet **Production URL** ou **Test URL** → bouton copier

---

## Étape 4 — Configurer le token secret dans n8n

Le workflow vérifie le header `Authorization: Bearer TON_TOKEN`.

### 4a. Choisir un secret

Exemple (génère le tien) :

```
patentiq-ompic-n8n-2026-xK9mQ2
```

### 4b. Ajouter la variable dans n8n

**n8n Cloud :**

1. **Settings** (engrenage) → **Variables**
2. **Add variable**
   - Name : `OMPIC_PROXY_TOKEN`
   - Value : `patentiq-ompic-n8n-2026-xK9mQ2`
3. Save

**n8n local (Docker) :**

Redémarre le conteneur avec la variable :

```powershell
docker stop n8n
docker rm n8n
docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n -e OMPIC_PROXY_TOKEN=patentiq-ompic-n8n-2026-xK9mQ2 n8nio/n8n
```

### 4c. Activer le workflow

1. En haut à droite : interrupteur **Inactive → Active** (vert)
2. Confirme — le webhook production est maintenant live

---

## Étape 5 — Configurer PatentIQ

Ouvre `C:\Users\DELL\patent\.env.local` et ajoute (ou modifie) :

```env
# --- Surveillance OMPIC via n8n ---
OMPIC_SEARCH_MODE=proxy
OMPIC_PROXY_URL=https://TON-NOM.app.n8n.cloud/webhook/ompic-search
OMPIC_PROXY_TOKEN=patentiq-ompic-n8n-2026-xK9mQ2
```

Remplace :
- `TON-NOM` par ton sous-domaine n8n
- Le token par **exactement** la même valeur que dans n8n

**Modes utiles :**

| Variable | Valeur | Quand |
|----------|--------|-------|
| `OMPIC_SEARCH_MODE=proxy` | n8n uniquement | Production n8n OK |
| `OMPIC_SEARCH_MODE=hybrid` | n8n puis stub si échec | Tests / secours |
| `OMPIC_SEARCH_MODE=stub` | Pas de n8n | Démo sans n8n |

---

## Étape 6 — Migration BDD + redémarrer PatentIQ

PowerShell dans le dossier projet :

```powershell
cd C:\Users\DELL\patent
npm run db:push
```

Puis redémarre l’app (Ctrl+C si déjà lancée) :

```powershell
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## Étape 7 — Tests (dans l’ordre)

### Test 7a — n8n seul (curl / PowerShell)

**PowerShell :**

```powershell
$headers = @{
  "Authorization" = "Bearer patentiq-ompic-n8n-2026-xK9mQ2"
  "Content-Type"  = "application/json"
}
$body = '{"query":"Coca-Cola","asset_type":"trademark","territory":"MA"}'

Invoke-RestMethod -Method POST -Uri "https://TON-NOM.app.n8n.cloud/webhook/ompic-search" -Headers $headers -Body $body
```

**Résultat attendu :**

```json
{
  "results": [
    {
      "title": "Coca-Kola",
      "ref": "MA-M-2024-011203",
      "source": "ompic_n8n",
      "score": 0.88,
      "opposition_eligible": true
    }
  ]
}
```

| Problème | Solution |
|----------|----------|
| 404 | Workflow pas activé, ou mauvaise URL (test vs production) |
| 401 / results vides + error | Token différent entre n8n et `.env.local` |
| Timeout | Vérifier connexion internet / instance n8n |

### Test 7b — Dans n8n (Executions)

1. Lance le curl ci-dessus
2. n8n → **Executions** (menu gauche)
3. Tu dois voir une exécution **Success** avec les 3 nodes verts

### Test 7c — Dans PatentIQ (bout en bout)

1. Connecte-toi (porteur ou CPI)
2. Va sur **Surveillance** : `/dashboard/surveillance`
3. Vérifie la bannière : *« proxy n8n branché (proxy) »*
4. **Portefeuille** → Ajouter un actif :
   - Nom : `Coca-Cola`
   - Type : Marque
   - N° enregistrement : `MA-M-2019-004521` (optionnel)
5. Clique **Scanner OMPIC**
6. Message attendu : *« Scan terminé — X nouvelle(s) alerte(s) (proxy) »*
7. Section **Alertes similarité** → similarités type *Coca-Kola*
8. Teste **Opposition déposée** / **Prise en compte**

### Test 7d — Brevet (#32)

1. Ajoute un actif type **Brevet** : `Gourde Filtrante`
2. Scanner OMPIC → alertes brevets similaires (`MA-B-…`)

---

## Étape 8 — Scan automatique hebdomadaire (optionnel)

PatentIQ a déjà un worker : `POST /api/surveillance/worker`

### Option A — GitHub Actions (déjà dans le repo)

Fichier `.github/workflows/surveillance-scan.yml`  
Secrets GitHub : `APP_URL`, `AI_WORKER_SECRET`

### Option B — Second workflow n8n (cron)

1. n8n → **New workflow**
2. Node **Schedule Trigger** → Lundi 07:00
3. Node **HTTP Request** :
   - Method : POST
   - URL : `http://localhost:3000/api/surveillance/worker` (ou URL Vercel)
   - Header : `Authorization` = `Bearer TON_AI_WORKER_SECRET`
4. Activer

Le worker PatentIQ parcourt toute la watchlist et appelle **ton webhook n8n** pour chaque actif.

---

## Dépannage rapide

| Symptôme | Cause probable | Fix |
|----------|----------------|-----|
| Badge « stub démo » | `OMPIC_SEARCH_MODE` pas `proxy` | `.env.local` + redémarrer `npm run dev` |
| 0 alerte après scan | Query ne matche pas le catalogue stub | Essayer « Coca » ou « Cola » |
| Erreur SQL watchlist | Migration 00028 pas appliquée | `npm run db:push` |
| PatentIQ n’atteint pas n8n local | localhost inaccessible depuis Vercel | Tester en local, ou n8n Cloud |
| `fetch failed` | URL webhook incorrecte | Copier URL depuis node Webhook n8n |

---

## Après le stub — brancher le vrai OMPIC

Le workflow stub simule le catalogue. Pour la production I2PA :

1. Remplace le node **Code** par **HTTP Request** vers [ompic.ma](https://www.ompic.ma) / [patent.ompic.ma](https://patent.ompic.ma)
2. Ajoute un node **HTML** / **Code** pour parser les résultats
3. Garde le même format JSON de sortie (`results[]`)
4. Valide juridiquement avec ton encadrante I2PA

Voir [N8N_OMPIC_SURVEILLANCE.md](./N8N_OMPIC_SURVEILLANCE.md) § 3.

---

## Checklist finale

- [ ] Compte n8n créé
- [ ] Workflow importé et **activé**
- [ ] Variable `OMPIC_PROXY_TOKEN` dans n8n
- [ ] `.env.local` : `OMPIC_SEARCH_MODE`, `OMPIC_PROXY_URL`, `OMPIC_PROXY_TOKEN`
- [ ] `npm run db:push` OK
- [ ] Test curl → JSON `results`
- [ ] PatentIQ → scan → alertes → opposition

---

*Prochaine étape projet : **Verdict J** (veille techno + FTO + recherche OMPIC dans l’antériorité).*
