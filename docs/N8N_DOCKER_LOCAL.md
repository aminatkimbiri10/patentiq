# n8n en local avec Docker — guide pas à pas

**Objectif :** PatentIQ (`localhost:3000`) appelle n8n (`localhost:5678`) pour simuler le catalogue OMPIC.

```
PatentIQ :3000  ──POST──►  n8n :5678/webhook/ompic-search  ──►  JSON similarités
```

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et **démarré** (icône baleine verte)
- PatentIQ cloné dans `C:\Users\DELL\patent`

Vérification PowerShell :

```powershell
docker --version
docker ps
```

---

## Étape 1 — Démarrer n8n (Docker)

### Option A — docker compose (recommandé)

PowerShell :

```powershell
cd C:\Users\DELL\patent
docker compose -f docker-compose.n8n.yml up -d
```

### Option B — commande docker directe

Si un conteneur `n8n` existe déjà :

```powershell
docker stop n8n
docker rm n8n
```

Puis :

```powershell
docker volume create n8n_data

docker run -d `
  --name n8n `
  -p 5678:5678 `
  -v n8n_data:/home/node/.n8n `
  -e OMPIC_PROXY_TOKEN=patentiq-ompic-n8n-2026-xK9mQ2 `
  -e GENERIC_TIMEZONE=Africa/Casablanca `
  n8nio/n8n
```

### Vérification

```powershell
docker ps
```

Tu dois voir `n8n` avec `0.0.0.0:5678->5678/tcp`.

Ouvre **[http://localhost:5678](http://localhost:5678)** — création du compte owner (première visite uniquement).

---

## Étape 2 — Importer le workflow PatentIQ

1. Ouvre [http://localhost:5678](http://localhost:5678)
2. Menu **⋯** (haut droite) → **Import from file**
3. Fichier :

   ```
   C:\Users\DELL\patent\docs\n8n\ompic-proxy-stub-workflow.json
   ```

4. Le canvas affiche 3 nodes :
   - **Webhook POST /search** (path : `ompic-search`)
   - **Catalogue stub + similarité**
   - **Respond JSON**

5. **Save** (Ctrl+S)

---

## Étape 3 — Publier le workflow (n8n 2.x)

> **n8n 2.x** : il n’y a plus le bouton « Active ». C’est remplacé par **Publish**.

1. Interrupteur / bouton **Publish** (en haut à droite, à côté de Share)
2. Donne un nom de version (ex. `v1`) → confirme
3. Le compteur passe de `0/1` à `1/1` (workflow live)

Pour désactiver : menu **⋯** → **Unpublish**

### ⚠️ Ne teste PAS l’URL dans le navigateur

Ouvrir `http://localhost:5678/webhook/ompic-search` dans Chrome = requête **GET** → erreur :

```json
{"code":404,"message":"This webhook is not registered for GET requests. Did you mean to make a POST request?"}
```

C’est **normal** : le webhook n’accepte que **POST**. Utilise PowerShell (étape 7).

---

## Étape 4 — Copier l’URL webhook (POST uniquement)

Le conteneur définit :

```
OMPIC_PROXY_TOKEN=patentiq-ompic-n8n-2026-xK9mQ2
```

Le node **Code** du workflow lit `$env.OMPIC_PROXY_TOKEN`.

Pour changer le token :

1. Modifie `docker-compose.n8n.yml` (variable `OMPIC_PROXY_TOKEN`)
2. `docker compose -f docker-compose.n8n.yml up -d --force-recreate`
3. Mets **le même** token dans `.env.local` PatentIQ

---

## Étape 5 — Configurer PatentIQ

Édite `C:\Users\DELL\patent\.env.local` :

```env
OMPIC_SEARCH_MODE=proxy
OMPIC_PROXY_URL=http://localhost:5678/webhook/ompic-search
OMPIC_PROXY_TOKEN=patentiq-ompic-n8n-2026-xK9mQ2
```

| Mode | Usage local |
|------|-------------|
| `proxy` | n8n uniquement |
| `hybrid` | n8n + fallback stub PatentIQ si n8n down |

**Redémarre** PatentIQ après modification :

```powershell
cd C:\Users\DELL\patent
npm run dev
```

---

## Étape 6 — Migration BDD (si pas déjà fait)

```powershell
cd C:\Users\DELL\patent
npm run db:push
```

---

## Étape 7 — Test (POST obligatoire)

### Plan A — Proxy local PatentIQ (recommandé si n8n renvoie vide)

PatentIQ inclut le **même contrat** que n8n en local :

`.env.local` :

```env
OMPIC_SEARCH_MODE=proxy
OMPIC_PROXY_URL=http://localhost:3000/api/ompic-proxy/search
OMPIC_PROXY_TOKEN=patentiq-ompic-n8n-2026-xK9mQ2
```

```powershell
npm run dev
```

Puis test :

```powershell
$headers = @{
  "Authorization" = "Bearer patentiq-ompic-n8n-2026-xK9mQ2"
  "Content-Type"  = "application/json"
}
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3000/api/ompic-proxy/search" `
  -Headers $headers `
  -Body '{"query":"Coca-Cola","asset_type":"trademark","territory":"MA"}'
```

### Plan B — n8n Docker (POST, pas le navigateur)

```powershell
$headers = @{
  "Authorization" = "Bearer patentiq-ompic-n8n-2026-xK9mQ2"
  "Content-Type"  = "application/json"
}
$body = '{"query":"Coca-Cola","asset_type":"trademark","territory":"MA"}'

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:5678/webhook/ompic-search" `
  -Headers $headers `
  -Body $body
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

Dans n8n → **Executions** : une ligne **Success**.

### Erreurs fréquentes

| Message | Cause | Fix |
|---------|-------|-----|
| `webhook "POST ompic-search" is not registered` | Workflow pas importé ou pas **actif** | Import + Active |
| 401 / `Unauthorized` | Token différent | Aligner Docker + `.env.local` |
| Réponse POST vide (200 sans JSON) | Bug n8n 2.x + node Respond | Utilise **Plan A** ou réimporte le workflow (`responseMode: lastNode`, 2 nodes) puis **Publish** |

---

## Étape 8 — Test PatentIQ (bout en bout)

1. [http://localhost:3000](http://localhost:3000) → connexion porteur ou CPI
2. **Surveillance** → `/dashboard/surveillance`
3. Bannière : **proxy n8n branché (proxy)**
4. **Portefeuille** → ajouter :
   - Nom : `Coca-Cola`
   - Type : **Marque**
5. **Scanner OMPIC**
6. Section **Alertes similarité** → *Coca-Kola*, *Koka Cola*
7. Tester **Opposition déposée**

---

## Étape 9 — Mode test n8n (debug)

Sans activer le workflow :

1. Ouvre le workflow dans n8n
2. Clique **Test workflow** (ou Execute workflow)
3. Pendant ~120 s, appelle :

   ```
   http://localhost:5678/webhook-test/ompic-search
   ```

Utile pour déboguer le node Code avant activation.

---

## Commandes utiles

```powershell
# Voir les logs n8n
docker logs -f n8n

# Arrêter
docker compose -f docker-compose.n8n.yml down

# Redémarrer
docker compose -f docker-compose.n8n.yml restart

# Tout supprimer (données n8n conservées dans le volume)
docker compose -f docker-compose.n8n.yml down
docker volume rm n8n_data   # optionnel — efface comptes/workflows n8n
```

---

## Checklist

- [ ] Docker Desktop démarré
- [ ] `docker ps` → conteneur `n8n` sur port 5678
- [ ] Compte n8n créé sur localhost:5678
- [ ] Workflow importé depuis `docs/n8n/ompic-proxy-stub-workflow.json`
- [ ] Workflow **Active** (vert)
- [ ] Test PowerShell → JSON `results`
- [ ] `.env.local` → `OMPIC_PROXY_URL=http://localhost:5678/webhook/ompic-search`
- [ ] `npm run dev` redémarré
- [ ] Scan PatentIQ → alertes

---

## Limitation locale

`localhost:5678` fonctionne pour **PatentIQ en local** (`npm run dev`).

Si PatentIQ est sur **Vercel** (cloud), il ne peut pas joindre ton `localhost` → il faudra n8n Cloud ou un tunnel (ngrok).

Pour le stage / démo : **PatentIQ local + n8n Docker local** suffit.

---

## Suite

- Cron hebdo : voir [N8N_OMPIC_SURVEILLANCE.md](./N8N_OMPIC_SURVEILLANCE.md) § 9
- Vrai scrape OMPIC : remplacer le node Code par HTTP Request + parsing HTML
- Verdict J : veille techno + FTO
