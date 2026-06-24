# Providers IA — analyses projet

PatentIQ combine deux APIs **gratuites** (avec inscription) pour les analyses brevets et la synthèse textuelle via **Hugging Face**.

## Architecture

```
Utilisateur → POST /api/ai/search
           → worker (processAiSearch)
           → runAiSearch()
                ├─ EPO OPS (brevets réels)  ou stub si clés absentes
                └─ Hugging Face (synthèse FR) ou template si clé absente
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

## 2. Hugging Face (synthèse LLM) — gratuit

- **API** : [Inference Providers router](https://huggingface.co/docs/inference-providers) (`router.huggingface.co`)
- **Token** : [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — token **Read** suffit
- **Modèle par défaut** : `Qwen/Qwen2.5-7B-Instruct` (compatible API chat)

### Variables `.env.local`

```env
HUGGINGFACE_API_KEY=hf_votre_token
# optionnel :
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
```

Alias accepté : `HF_TOKEN`, `HF_MODEL`.

Sans `HUGGINGFACE_API_KEY`, une **synthèse template** (français) est générée à partir des résultats.

## Exemple `.env.local` complet

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_WORKER_SECRET=patentiq-worker-dev-xxx

EPO_OPS_CONSUMER_KEY=...
EPO_OPS_CONSUMER_SECRET=...
HUGGINGFACE_API_KEY=hf_...
```

Redémarrer le serveur après modification : `npm run dev:clean`

## Types d'analyse (onglet IA projet)

| Type | Provider | Description |
|------|----------|-------------|
| `novelty` | EPO + Hugging Face | Recherche d'antériorité brevets |
| `semantic` | EPO + Hugging Face | Comparaison conceptuelle |
| `similarity` | EPO + Hugging Face | Proximité avec le résumé d'invention |
| `summarization` | Hugging Face | Résumé dossier ou document (CSV, TXT, PDF texte) |
| `classification` | Hugging Face | Classes IPC/CPC suggérées |
| `tag_suggestion` | Hugging Face | Tags recommandés pour le dossier |
| Assistant PI (chat) | Hugging Face | Conversation multi-tours (bulle flottante sur la page projet) |
| `report` | Agrégation | Rapport consolidé (bouton dédié) |

## Tester

1. Projet → onglet **IA** → choisir le type d'analyse
2. Nouveauté : saisir `membrane filtration water treatment`
3. Sous le titre, vérifier : `brevets EPO OPS (gratuit) · synthèse Hugging Face (Qwen2.5-7B-Instruct)`
4. Lancer → résultats avec vrais numéros EP/US/WO et lien Espacenet (`payload.espacenet_url`)
5. Résumé : sélectionner un PDF/CSV/TXT uploadé ou laisser vide pour résumer le dossier

## Extraction PDF (résumé document)

Les PDF avec **couche texte** sont parsés côté serveur via [unpdf](https://github.com/unjs/unpdf) (PDF.js) :

- Taille max : **10 Mo**
- Pages max extraites : **40** (puis troncature à 12 000 caractères pour l'IA)
- PDF scannés (image seule) : message invitant à fournir TXT ou résumé d'invention
- Pas besoin de clé Hugging Face pour l'extraction — seulement pour la synthèse

## Fallbacks

| Situation | Comportement |
|-----------|--------------|
| Pas de clés EPO | Stub (4 brevets simulés) |
| EPO en erreur | Stub + note dans le résumé |
| Pas de Hugging Face | Synthèse template en français |
| Hugging Face en erreur | Synthèse template ou réponse indicative (Assistant) |

## Erreur « not a chat model » (400)

L'endpoint `router.huggingface.co/v1/chat/completions` n'accepte que des **modèles conversationnels**. Des modèles instruct classiques (ex. `mistralai/Mistral-7B-Instruct-v0.3`) renvoient une erreur 400.

**Solution** : utilisez un modèle chat, par exemple :

```env
HUGGINGFACE_MODEL=Qwen/Qwen2.5-7B-Instruct
```

Activez aussi **Inference Providers** sur [huggingface.co/settings/inference-providers](https://huggingface.co/settings/inference-providers) pour votre compte.

## Quota / erreurs Hugging Face (429, 503)

Le tier gratuit a des **limites de débit**. Si vous voyez `429` ou `503` :

1. Attendre quelques minutes (le client réessaie automatiquement)
2. Vérifier le token sur [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Changer de modèle via `HUGGINGFACE_MODEL` si le modèle par défaut est saturé
4. PatentIQ bascule sur une **réponse indicative** (hors-ligne) pour l'Assistant PI et les synthèses en cas d'échec

Les recherches **EPO OPS** (brevets) restent indépendantes du LLM.

## Limites & avertissement

- Les résultats **ne remplacent pas** une recherche d'antériorité officielle par un conseiller PI.
- EPO OPS : token renouvelé toutes les ~20 min (géré automatiquement).
- PDF scannés sans OCR : extraction impossible (fournir TXT ou résumé manuel).
- PatentsView USPTO : migré vers l'Open Data Portal (non intégré ici).

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/lib/ai/run-search.ts` | Orchestration |
| `src/lib/ai/providers/epo-ops.ts` | Recherche CQL EPO |
| `src/lib/ai/providers/synthesis.ts` | Synthèse nouveauté |
| `src/lib/ai/llm-client.ts` | Appels Hugging Face chat completions |
| `src/lib/ai/stub-engine.ts` | Fallback brevets |
| `src/lib/ai/worker.ts` | Persistance Supabase |
