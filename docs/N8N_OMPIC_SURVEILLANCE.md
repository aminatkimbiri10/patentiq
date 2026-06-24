# Surveillance OMPIC via n8n — Verdict I

**Architecture :** n8n = couche OMPIC (scan catalogue) · PatentIQ = portefeuille client + alertes + opposition.

L’OMPIC ne publie **pas d’API REST publique**. n8n compense en exposant un **webhook proxy** que PatentIQ appelle déjà (`OMPIC_PROXY_URL`).

---

## Schéma

```
PatentIQ                          n8n                           OMPIC
────────                          ───                           ─────
ip_watchlist (portefeuille)
       │
       ▼
scan watchlist ──POST /search──► Webhook ──► HTTP / scrape ──► ompic.ma
       │                              │
       ◄── JSON results ──────────────┘
       ▼
ip_watch_alerts + notifications
UI opposition (CPI / porteur)
```

**PatentIQ ne scrape pas OMPIC.** Il stocke les actifs client, déclenche le scan, enregistre les alertes et gère l’opposition dans l’UI.

---

## 1. Portefeuille client (PatentIQ — #29)

Table `ip_watchlist` :

| Champ | Usage |
|-------|--------|
| `title` | Nom marque / brevet |
| `registration_number` | N° OMPIC |
| `nice_classes` | Classes Nice / IPC |
| `registered_at` | Date enregistrement |
| `logo_url` | URL logo (optionnel) |
| `asset_type` | `trademark` \| `patent` |
| `surveillance_active` | Scan actif |

UI : `/dashboard/surveillance` · `/cpi/surveillance`

---

## 2. Workflow n8n — proxy `/search`

### Prérequis

- Instance n8n (cloud ou self-hosted) accessible en **HTTPS**
- Token secret partagé avec PatentIQ

### Nodes recommandés

| # | Node | Rôle |
|---|------|------|
| 1 | **Webhook** | `POST /search`, auth Header `Authorization: Bearer TOKEN` |
| 2 | **Code** ou **HTTP Request** | Recherche catalogue (voir § 3) |
| 3 | **Respond to Webhook** | Retour JSON contrat PatentIQ |

### Contrat entrée (PatentIQ → n8n)

```json
{
  "query": "Coca-Cola",
  "asset_type": "trademark",
  "territory": "MA",
  "registration_number": "MA-M-2019-004521",
  "nice_classes": "32",
  "summary": "Boissons gazeuses",
  "logo_url": "https://example.com/logo.png"
}
```

### Contrat sortie (n8n → PatentIQ)

```json
{
  "results": [
    {
      "title": "Coca-Kola",
      "ref": "MA-M-2024-011203",
      "source": "ompic",
      "summary": "Marque verbale — classe 32",
      "score": 0.82,
      "publication_end_at": "2026-08-15",
      "opposition_eligible": true
    }
  ]
}
```

| Champ | Obligatoire | Description |
|-------|-------------|-------------|
| `title` | oui | Dénomination similarité |
| `ref` | recommandé | Référence OMPIC |
| `source` | oui | `ompic`, `ompic_n8n`, etc. |
| `score` | recommandé | 0–1 similarité |
| `publication_end_at` | marques | Fin fenêtre publication → opposition |
| `opposition_eligible` | marques | `true` si opposition possible |

---

## 3. Recherche OMPIC dans n8n (sans API)

Options par ordre de pragmatisme :

### A. Stub n8n (test / démo)

Workflow `docs/n8n/ompic-proxy-stub-workflow.json` — catalogue local, similarité texte.  
Permet de valider `OMPIC_SEARCH_MODE=proxy` avant scraping réel.

### B. HTTP Request + parsing HTML

- Marques : pages publiques [ompic.ma](https://www.ompic.ma)
- Brevets : [patent.ompic.ma](https://patent.ompic.ma)

⚠️ Vérifier conditions d’usage avec I2PA / OMPIC. HTML fragile si le site change.

### C. Import périodique CSV / open data

n8n **Schedule** → télécharge fichier → stocke en base n8n / Redis → webhook `/search` interroge cette base.

### D. Partenariat officiel

Flux sécurisé fourni par OMPIC ou prestataire agréé — remplace le scrape.

---

## 4. Configuration PatentIQ

`.env.local` :

```env
OMPIC_SEARCH_MODE=proxy
# URL complète du webhook n8n (copier depuis le node Webhook — sans ajouter /search)
OMPIC_PROXY_URL=https://votre-n8n.app.n8n.cloud/webhook/ompic-search
OMPIC_PROXY_TOKEN=votre-secret-partagé
```

Modes :

| Mode | Comportement |
|------|--------------|
| `stub` | Catalogue démo intégré (défaut) |
| `proxy` | n8n uniquement |
| `hybrid` | n8n d’abord, stub si échec |

---

## 5. Cron — qui déclenche le scan ?

**Option A — PatentIQ (recommandé)**  
GitHub Actions ou cron n8n appelle :

```http
POST https://patentiq.vercel.app/api/surveillance/worker
Authorization: Bearer {SURVEILLANCE_WORKER_SECRET}
```

PatentIQ parcourt `ip_watchlist` et appelle n8n pour **chaque actif**.

**Option B — n8n seul (non recommandé)**  
n8n lit Supabase, écrit alertes — duplique la logique PatentIQ.

---

## 6. Alertes & opposition (#31 — PatentIQ)

Après scan, PatentIQ :

1. Insère dans `ip_watch_alerts` (dédoublonnage par `matched_ref`)
2. Notifie porteur + CPI assigné
3. Affiche actions : **Prise en compte** · **Opposition déposée** · **Écarter**

Statuts : `new` → `acknowledged` | `opposition_filed` | `dismissed`

Pour les **marques**, l’UI rappelle la fenêtre **~2 mois** de publication OMPIC.

---

## 7. Surveillance brevets (#32)

Même watchlist avec `asset_type: "patent"`.  
n8n interroge `patent.ompic.ma` (ou base brevets MA).  
PatentIQ affiche alertes veille concurrentielle post-publication.

---

## 8. Test rapide

Guide débutant complet : **[N8N_GUIDE_ETAPE_PAR_ETAPE.md](./N8N_GUIDE_ETAPE_PAR_ETAPE.md)**

### a) Importer le workflow stub

1. n8n → **Import from File** → `docs/n8n/ompic-proxy-stub-workflow.json`
2. Activer le workflow, copier l’URL webhook `/search`
3. Configurer `.env.local` (§ 4)
4. Redémarrer `npm run dev`
5. Surveillance → ajouter « Coca-Cola » → **Scanner OMPIC**

### b) Test curl direct n8n

```bash
curl -X POST "https://VOTRE-N8N/webhook/ompic-search" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"Coca-Cola","asset_type":"trademark","territory":"MA"}'
```

---

## 9. Cron n8n (optionnel — déclencher worker PatentIQ)

Workflow séparé :

1. **Schedule Trigger** — lundi 06:00
2. **HTTP Request** — `POST {APP_URL}/api/surveillance/worker` + Bearer secret

Équivalent au workflow GitHub `.github/workflows/surveillance-scan.yml`.

---

## 10. Prochaines étapes (autres verdicts)

| Verdict | Sujet | Outil |
|---------|--------|-------|
| **J** | Veille techno EPO + FTO + OMPIC recherche | PatentIQ + n8n OMPIC |
| **K–L** | Rédaction, revendications, export | PatentIQ uniquement |
| **M** | Workflows marque/brevet, échéances | PatentIQ (déjà en place) |

---

## Références

- [OMPIC_SURVEILLANCE.md](./OMPIC_SURVEILLANCE.md) — worker, migrations
- [WORKER_AND_DEPLOY.md](./WORKER_AND_DEPLOY.md) — déploiement Vercel
- `src/lib/surveillance/ompic-provider.ts` — client proxy
- Migration `00028_watchlist_portfolio.sql` — logo, date enregistrement
