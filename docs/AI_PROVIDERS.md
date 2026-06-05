# Providers IA — recherche de nouveauté

PatentIQ combine deux APIs **gratuites** (avec inscription) pour la recherche de nouveauté.

## Architecture

```
Utilisateur → POST /api/ai/search
           → worker (processAiSearch)
           → runAiSearch()
                ├─ EPO OPS (brevets réels)  ou stub si clés absentes
                └─ Gemini (synthèse FR)     ou template si clé absente
           → ai_results + ai_searches en base
```

## 1. EPO Open Patent Services (brevets) — gratuit

- **Quota** : ~4 Go/semaine sans frais ([fair use EPO](https://www.epo.org/en/searching-for-patents/data/web-services/ops))
- **Couverture** : brevets mondiaux (Espacenet / DOCDB)

### Obtenir les clés

1. Créer un compte sur [developers.epo.org](https://developers.epo.org/)
2. **My Apps** → **Add a new App**
3. Copier **Consumer Key** et **Consumer Secret**

### Variables `.env.local`

```env
EPO_OPS_CONSUMER_KEY=votre_consumer_key
EPO_OPS_CONSUMER_SECRET=votre_consumer_secret
```

Sans ces variables, l'app utilise le **stub** (brevets fictifs).

## 2. Google Gemini (synthèse) — gratuit

- **Quota** : tier gratuit via [Google AI Studio](https://aistudio.google.com/apikey) (sans carte bancaire)
- **Modèle par défaut** : `gemini-2.0-flash`

### Variables `.env.local`

```env
GEMINI_API_KEY=votre_cle_gemini
# optionnel :
GEMINI_MODEL=gemini-2.0-flash
```

Sans `GEMINI_API_KEY`, une **synthèse template** (français) est générée à partir des résultats.

## Exemple `.env.local` complet

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_WORKER_SECRET=patentiq-worker-dev-xxx

EPO_OPS_CONSUMER_KEY=...
EPO_OPS_CONSUMER_SECRET=...
GEMINI_API_KEY=...
```

Redémarrer le serveur après modification : `npm run dev:clean`

## Tester

1. Projet → onglet **IA**
2. Saisir : `membrane filtration water treatment`
3. Sous le titre, vérifier : `brevets EPO OPS (gratuit) · synthèse Gemini (gratuit)`
4. Lancer → résultats avec vrais numéros EP/US/WO et lien Espacenet dans le détail (`payload.espacenet_url`)

## Fallbacks

| Situation | Comportement |
|-----------|--------------|
| Pas de clés EPO | Stub (4 brevets simulés) |
| EPO en erreur | Stub + note dans le résumé |
| Pas de Gemini | Synthèse template en français |
| Gemini en erreur | Synthèse template |

## Limites & avertissement

- Les résultats **ne remplacent pas** une recherche d'antériorité officielle par un conseiller PI.
- EPO OPS : token renouvelé toutes les ~20 min (géré automatiquement).
- PatentsView USPTO : migré vers l'Open Data Portal (non intégré ici).

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/lib/ai/run-search.ts` | Orchestration |
| `src/lib/ai/providers/epo-ops.ts` | Recherche CQL EPO |
| `src/lib/ai/providers/gemini.ts` | Synthèse IA |
| `src/lib/ai/stub-engine.ts` | Fallback brevets |
| `src/lib/ai/worker.ts` | Persistance Supabase |
