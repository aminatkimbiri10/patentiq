# Préparation démo — Priorité 1 (démo-proof)

Checklist **2–3 jours avant** la présentation encadrante.  
Objectif : deux parcours **marque** et **brevet** exécutables en 10–18 min sans improvisation.

---

## 1. Environnement technique

### Migrations Supabase

Appliquer toutes les migrations (au minimum `00025` → `00032`) :

```bash
npm run db:push
```

### Variables `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
HUGGINGFACE_API_KEY=...
AI_WORKER_SECRET=...
EPO_OPS_CONSUMER_KEY=...        # recommandé brevet / FTO
EPO_OPS_CONSUMER_SECRET=...

# Démo encadrante — live puis stub si portail down
OMPIC_SEARCH_MODE=hybrid
```

| Mode | Usage |
|------|--------|
| `live` | Production / vraie recherche OMPIC |
| `hybrid` | **Recommandé démo** — live puis catalogue stub |
| `stub` | Démo offline (annoncer clairement) |

### Terminaux le jour J

```bash
# Terminal 1
npm run dev

# Terminal 2 (analyses IA en attente)
npm run ai:worker:loop
```

**Alternative prod :** GitHub Actions `ai-worker.yml` (5 min) + `surveillance-scan.yml` (lundi 06:00 UTC) avec secrets `APP_URL` + `AI_WORKER_SECRET`.

### Comptes

| Rôle | Email | Vérifier |
|------|-------|----------|
| Porteur | `aminatkimbiri@gmail.com` | Email **confirmé** |
| CPI | `kimbiriaminata16@gmail.com` | Email **confirmé** |

---

## 2. Scénario A — Marque (10 min)

### Données à créer (porteur)

| Champ | Valeur suggérée |
|-------|-----------------|
| Catégorie | **Marque** |
| Titre | `TechMaroc` ou marque client réelle |
| Résumé | Signe distinctif, secteur, classes Nice visées |
| Document | Logo ou PDF mandat (optionnel) |

### Parcours écran par écran

1. **Mes projets** → ouvrir le dossier marque  
2. **Dossier → Parcours PI → Cycle marque**  
   - Statut : **Publié** (date publication renseignée)  
   - Montrer rappel **échéance opposition ~2 mois**  
3. **Surveillance → Portefeuille**  
   - Ajouter actif : titre, classes Nice (ex. 35, 42), n° enregistrement si connu  
4. **Surveillance → Scanner OMPIC**  
   - Requête : `Coca` ou `TechMaroc`  
   - Bannière mode OMPIC visible (live ou hybrid)  
5. **Surveillance → Alertes**  
   - Traiter 1 alerte : **Vu — à suivre** ou **Opposition lancée**  
   - Ouvrir **fiche opposition** (suivi interne, pas dépôt directompic)

### Messages clés

- « Marque ≠ brevet : **2 mois** de publication, pas 18 mois. »  
- « La fiche opposition = suivi CPI, le dépôt officiel reste sur OMPIC. »

### Plan B marque

| Problème | Action |
|----------|--------|
| Scan OMPIC vide / timeout | Passer `OMPIC_SEARCH_MODE=stub` ou garder `hybrid` |
| Pas d'alerte | Utiliser watchlist pré-remplie + rescan manuel |
| Portail OMPIC down | Montrer bannière « mode démo / secours » |

---

## 3. Scénario B — Brevet (10 min)

### Données à créer (porteur)

| Champ | Valeur suggérée |
|-------|-----------------|
| Catégorie | **Brevet d'invention** |
| Titre | `Système de filtration intelligent` |
| Résumé invention | 3–5 phrases concrètes |
| Besoin PI | Protection nationale Maroc |

### Contenu Parcours PI (pré-remplir la veille)

| Section | Minimum démo |
|---------|--------------|
| **Rédaction** | Titre + domaine technique + description (brouillon IA OK) |
| **Revendications** | 1 indépendante + 2 dépendantes |
| **Cycle brevet** | Statut **Déposé** ou **Examen**, date dépôt |

### Analyse IA (la veille)

1. Onglet **IA → Nouveauté** ou **FTO**  
2. Lancer l'analyse  
3. Vérifier statut **`completed`** (worker tourné)  
4. Garder l'historique pour montrer sans relancer

### Exports

- **Exporter dossier OMPIC** (HTML → PDF navigateur)  
- **Export ZIP dossier** (docs + rédaction + analyses IA)

### Messages clés

- « Rédaction et revendications ≠ fil de commentaires. »  
- « Antériorité : EPO international + brevets marocains via EPO `pa=MA`. »

### Plan B brevet

| Problème | Action |
|----------|--------|
| IA bloquée `pending` | `npm run ai:worker:loop` ou historique `completed` |
| Export ZIP vide | Ajouter 1 document PDF ou compléter rédaction |
| EPO timeout | Montrer analyse déjà terminée |

---

## 4. Vue CPI (5 min)

1. Connexion CPI → **Dossiers**  
2. Ouvrir le **même brevet**  
3. Changer statut → **Revue CPI**  
4. Commentaire **juridique** (onglet Échanges)  
5. Ouvrir dossier **marque** → cycle + surveillance

---

## 5. Page Préparer dépôt OMPIC

Menu **Préparer dépôt OMPIC** → checklists marque/brevet + lien **directompic.ma**.

**À dire :** « PatentIQ structure le dossier ; le CPI dépose sur le portail officiel. »

---

## 6. Vérifications automatiques (avant démo)

```bash
npm run typecheck
npm test
npm run test:e2e
```

Tests E2E optionnels avec compte réel :

```bash
PLAYWRIGHT_TEST_EMAIL=... PLAYWRIGHT_TEST_PASSWORD=... npm run test:e2e
```

---

## 7. Checklist jour J (5 min)

- [ ] `npm run dev` + worker IA actif ou cron configuré  
- [ ] `OMPIC_SEARCH_MODE=hybrid`  
- [ ] Projet marque + brevet ouverts dans onglets navigateur  
- [ ] Au moins 1 alerte surveillance traitable  
- [ ] Analyse IA `completed` visible  
- [ ] Export ZIP testé une fois  
- [ ] Mots de passe porteur + CPI mémorisés  
- [ ] [ATTENTES_ENCADRANTE_MAPPING.md](./ATTENTES_ENCADRANTE_MAPPING.md) imprimé ou en PDF  

---

## 8. Scénario express (10 min total)

1. Brevet → Parcours PI (rédaction + export ZIP) — **3 min**  
2. Surveillance → scan marque → alerte — **3 min**  
3. CPI → statut + commentaire — **2 min**  
4. Préparer dépôt OMPIC + message directompic — **2 min**

---

*Voir aussi [DEMO_ENCADRANTE.md](./DEMO_ENCADRANTE.md) pour le script complet 18 min.*
