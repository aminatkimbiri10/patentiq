# Verdict K–L — Rédaction brevet, revendications & export OMPIC

**Architecture :** PatentIQ uniquement (pas de n8n). Espace **confidentiel** distinct de la messagerie.

---

## Schéma

```
Dossier brevet (porteur / CPI)
        │
        ▼
Parcours PI
        ├── Rédaction — sections OMPIC (titre, domaine, état de l'art, description, abrégé)
        ├── Revendications — indépendante + dépendantes (confidentiel)
        └── Export — HTML imprimable → directompic.ma
```

---

## 1. Rédaction (Verdict K)

| Section | Champ DB | Usage OMPIC |
|---------|----------|-------------|
| Titre | `title` | Intitulé de l'invention |
| Domaine technique | `technical_field` | Préambule description |
| État de la technique | `background` | Antériorité citée |
| Description détaillée | `description` | Corps du brevet |
| Abrégé | `abstract` | Publication (~150 mots) |

- Table : `patent_drafts` (migration `00027_patent_drafts.sql`)
- UI : **Dossier → Parcours PI → Rédaction**
- **Suggérer brouillon (IA)** : Hugging Face à partir du résumé invention + OCR documents + revendications existantes

---

## 2. Revendications (Verdict L)

| Élément | Stockage |
|---------|----------|
| Revendication indépendante | `independent_claim` |
| Revendications dépendantes | `dependent_claims` (JSON array) |

- Table : `patent_claims_drafts` (migration `00025`)
- UI : **Parcours PI → Revendications**
- Bannière **Confidentiel** — accès RLS porteur + CPI

---

## 3. Export dossier

```http
GET /api/projects/{projectId}/export-dossier
```

- Authentification requise (session Supabase)
- Retourne un **HTML** structuré (impression navigateur → PDF)
- Contenu : rédaction + revendications
- Bouton : **Exporter dossier OMPIC** dans Parcours PI (brevet)

---

## 4. Checklist brevet

| Item | Lien |
|------|------|
| `desc-technique` | Parcours PI → Rédaction |
| `revendications` | Parcours PI → Revendications |
| `anteriorite` | Onglet IA → Nouveauté (Verdict J) |

Badge **Renseigné** si contenu enregistré en base.

---

## 5. Démo soutenance (3 min)

1. Projet **brevet** → Parcours PI → **Suggérer brouillon (IA)**
2. Enregistrer → onglet **Revendications** → saisir revendication 1
3. **Exporter dossier OMPIC** → aperçu HTML → Imprimer en PDF
4. Montrer bannière confidentiel vs fil de commentaires

---

## Limites

- Pas de dépôt automatique sur directompic.ma (préparation uniquement)
- Pas d'historique de versions (roadmap future)
- IA = brouillon indicatif — **validation CPI obligatoire**

---

## Références

- `src/components/surveillance/patent-draft-panel.tsx`
- `src/components/surveillance/patent-claims-panel.tsx`
- `src/lib/export/build-patent-dossier-html.ts`
- Migration `00027_patent_drafts.sql`
