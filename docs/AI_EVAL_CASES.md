# Cas de test IA — PatentIQ

> Document pour la soutenance (filière IA appliquée).  
> Chaque cas décrit l’entrée, la sortie attendue et les limites connues.

---

## Cas 1 — Antériorité brevet (EPO + synthèse HF)

| Champ | Valeur |
|-------|--------|
| **Entrée** | Projet brevet avec résumé invention ≥ 50 caractères, type `novelty`, requête « filtration eau portable membrane » |
| **Providers** | `epo-ops` (brevets) + `huggingface` (synthèse) |
| **Sortie attendue** | Statut `completed`, liste de brevets avec `source_ref`, synthèse structurée en français, badge **Confiance élevée** si HF + EPO OK |
| **Limite** | Quota HF → synthèse template + badge **Confiance limitée** ; sans clés EPO → peu ou pas de résultats brevets |

**Vérification manuelle :** Parcours PI → Analyse IA → Historique → liens Espacenet sur chaque hit.

---

## Cas 2 — FTO (Freedom to Operate)

| Champ | Valeur |
|-------|--------|
| **Entrée** | Type `fto`, même domaine technique, revendications ou résumé rempli |
| **Sortie attendue** | Rapport orienté exploitation commerciale, mentions de brevets bloquants potentiels |
| **Limite** | Ne remplace pas un avis juridique ; couverture MA via EPO `pa=MA`, pas d’API OMPIC brevets directe |

---

## Cas 3 — Assistant chat avec RAG documents

| Champ | Valeur |
|-------|--------|
| **Entrée** | PDF uploadé avec OCR (`metadata.ocr_text`), question utilisateur contenant des mots du document |
| **Mécanisme** | `retrieveRelevantDocumentChunks` — chunks 900 car., score par mots-clés, top 3 injectés dans le prompt |
| **Sortie attendue** | Réponse citant ou s’appuyant sur le contenu du dossier |
| **Limite** | Pas d’embeddings vectoriels ; recherche lexicale simple ; documents sans texte extractible ignorés |

**Vérification :** Poser une question contenant un terme rare présent uniquement dans un PDF du dossier.

---

## Cas 4 — Brouillon brevet assisté

| Champ | Valeur |
|-------|--------|
| **Entrée** | Sections rédaction vides, résumé invention rempli, bouton « Suggérer avec l’IA » |
| **Sortie attendue** | 5 sections OMPIC pré-remplies (description, problème technique, etc.) |
| **Limite** | Template hors-ligne si HF indisponible ; relecture CPI obligatoire |

---

## Cas 5 — Veille technologique hebdo

| Champ | Valeur |
|-------|--------|
| **Entrée** | Veille active avec mots-clés + classes IPC, cron `/api/surveillance/worker` ou scan manuel |
| **Sortie attendue** | `last_report_summary` mis à jour, notification in-app si hits EPO/MA |
| **Limite** | Nécessite `EPO_OPS_CONSUMER_KEY` + `SECRET` ; résumé template si LLM non configuré |

---

## Métriques admin (24 h)

Visible dans **Admin → Santé système** et `/api/health` :

- Analyses `completed` / `failed` sur 24 h
- Nombre de fallbacks quota HF et synthèses template

---

## Commandes de validation

```bash
npm test -- tests/document-rag.test.ts tests/ai-analysis-meta.test.ts
npm run typecheck
```
