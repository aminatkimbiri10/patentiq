# Verdict J — Veille technologique, FTO & antériorité OMPIC

**Architecture :** PatentIQ interroge **EPO OPS** + **OMPIC live** (search.ompic.ma / brevets MA) — **sans n8n** en mode `live`.

---

## Schéma

```
Dossier projet (porteur / CPI)
        │
        ├── Onglet IA ──► Nouveauté / FTO / Sémantique
        │                      │
        │                      ├── EPO OPS (international)
        │                      ├── EPO pa=MA (brevets marocains)
        │                      └── OMPIC live (marques search.ompic.ma)
        │
        └── Surveillance ──► Veille technologique (hebdo)
                               ├── EPO + filtre IPC
                               └── Brevets MA (pa=MA)
```

**n8n** reste optionnel (`OMPIC_SEARCH_MODE=proxy`) — non requis pour le Verdict J.

---

## 1. Antériorité avec OMPIC (onglet IA)

| Type d'analyse | Usage | Sources |
|----------------|-------|---------|
| **Nouveauté** | Brevet / modèle d'utilité | EPO + OMPIC MA |
| **Sémantique** | Marque (antériorité) | OMPIC marques + EPO si besoin |
| **Similarité** | Dessin & modèle | EPO + OMPIC |
| **FTO** | Liberté d'exploitation | EPO + brevets MA (blocage commercial) |

### Déclenchement

1. Ouvrir un dossier → onglet **IA**
2. Choisir le type (ex. **FTO** pour checklist veille)
3. Saisir mots-clés ou utiliser le résumé d'invention
4. Télécharger le rapport PDF depuis l'historique

### Checklist

| Item | Analyse IA associée |
|------|---------------------|
| `anteriorite` | Nouveauté |
| `anteriorite-marque` | Sémantique / Nouveauté |
| `anteriorite-design` | Similarité |
| `fto` | FTO |

---

## 2. Veille technologique continue

- UI : `/dashboard/surveillance` → section **Veille technologique**
- Créer une veille : nom, mots-clés, classes IPC (optionnel)
- **Scanner maintenant** ou cron hebdo via worker

### Worker

```http
POST /api/surveillance/worker
Authorization: Bearer {AI_WORKER_SECRET}
```

Scanne : watchlist OMPIC + veilles actives + rappels échéances PI.

---

## 3. Configuration

```env
OMPIC_SEARCH_MODE=live
EPO_OPS_CONSUMER_KEY=...
EPO_OPS_CONSUMER_SECRET=...
HUGGINGFACE_API_KEY=...   # synthèse IA (optionnel)
```

Migration : `00029_ai_search_fto.sql` (type `fto`).

---

## 4. Limites (soutenance)

- Analyse **indicative** — validation CPI obligatoire
- OMPIC marques : max 100 résultats / requête (limite portail)
- Pas d'API REST OMPIC officielle — interrogation du portail public
- FTO ≠ avis juridique — mapping des revendications reste manuel

---

## Références

- [OMPIC_SURVEILLANCE.md](./OMPIC_SURVEILLANCE.md) — Verdict I (watchlist)
- `src/lib/ai/run-search.ts` — orchestration antériorité + FTO
- `src/lib/surveillance/ompic-prior-art.ts` — bridge OMPIC → résultats IA
- `src/lib/surveillance/tech-watch-runner.ts` — veille hebdo
