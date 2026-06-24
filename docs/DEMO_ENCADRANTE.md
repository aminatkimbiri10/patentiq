# Guide de démonstration — PatentIQ

Script de présentation pour l’**encadrante** (15 à 20 minutes).  
Aligné sur les attentes de la réunion de suivi : dossier collaboratif, rédaction/revendications, veille & surveillance, workflows marque/brevet, sécurité.

---

## Objectif de la démo

Montrer que PatentIQ couvre **quatre piliers** :

| Pilier | Message clé |
|--------|-------------|
| **1. Dossier collaboratif** | Porteur, CPI et expert travaillent dans un espace unique, traçable |
| **2. Rédaction & revendications** | Contenu confidentiel séparé des simples échanges |
| **3. Veille & surveillance** | Antériorité IA + watchlist OMPIC + veille techno continue |
| **4. Workflows PI par produit** | Marque (2 mois opposition) ≠ Brevet (18 mois publication) |

---

## Avant la démo — checklist technique

### 1. Migrations Supabase (obligatoire)

Appliquer dans l’ordre (SQL Editor ou `npm run db:push`) :

1. `00025_surveillance_claims.sql`
2. `00026_veille_commercialization.sql`
3. `00027_patent_drafts.sql`
4. `00028_watchlist_portfolio.sql`
5. `00029_ai_search_fto.sql`

Sans ces fichiers, les onglets **Parcours PI** et **Surveillance** peuvent échouer.

### 2. Variables d’environnement

Minimum pour une démo fluide :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
HUGGINGFACE_API_KEY=...          # synthèse IA + brouillon brevet
AI_WORKER_SECRET=...             # worker analyses
EPO_OPS_CONSUMER_KEY=...         # brevets EPO + Maroc (recommandé)
EPO_OPS_CONSUMER_SECRET=...
OMPIC_SEARCH_MODE=hybrid           # marques OMPIC — hybrid = live + secours démo si portail down
```

### 3. Lancer l’application

```bash
# Terminal 1
npm run dev

# Terminal 2 (analyses IA en attente)
npm run ai:worker:loop
```

Ouvrir : [http://localhost:3000](http://localhost:3000) → redirection connexion.

### 4. Comptes de démo

| Rôle | Email | Usage |
|------|-------|--------|
| **Porteur** | `aminatkimbiri@gmail.com` | Créer / suivre les projets |
| **CPI** | `kimbiriaminata16@gmail.com` | Revue dossier, statuts, surveillance |

> Préparer les mots de passe à l’avance. Vérifier que l’email est **confirmé** (sinon redirection `/auth/check-email`).

### 5. Données à préparer (recommandé)

Créer **deux projets** avant la réunion :

| Projet | Catégorie | Titre exemple | Intérêt démo |
|--------|-----------|---------------|--------------|
| A | **Marque** | « Coca-Cola » ou marque client | Scan OMPIC live, alertes similarité |
| B | **Brevet** | « Système de filtration intelligent » | Rédaction, revendications, export |

Pour chaque projet :

- Renseigner **résumé invention** et **besoin PI**
- Déposer au moins **1 document** (PDF)
- Assigner le dossier au **CPI** (depuis l’espace CPI ou admin)
- Cocher **2–3 items** de checklist

---

## Déroulé de la présentation (≈ 18 min)

### Introduction (2 min)

**À dire :**

> « PatentIQ est une plateforme professionnelle de gestion PI, pensée pour le contexte marocain et OMPIC.  
> Elle ne remplace pas directompic, mais **prépare, structure et suit** le dossier avant et après le dépôt.  
> Je vais montrer le parcours **porteur** puis la vue **conseil CPI**. »

**Montrer :** écran de connexion sobre (pas de landing marketing).

---

### Partie 1 — Porteur : dossier & collaboration (5 min)

**Connexion :** `aminatkimbiri@gmail.com`

#### 1.1 Tableau de bord

- Menu : **Accueil** → actions rapides (nouveau projet, surveillance, guide)
- Mentionner le widget **échéances PI** s’il apparaît (opposition marque / publication brevet)

#### 1.2 Ouvrir le projet **Brevet**

**Chemin :** Mes projets → clic sur le dossier

**Montrer dans l’ordre :**

1. **En-tête** — référence, statut, bandeau KPI (checklist, tâches, IA, messages)
2. **Onglet Dossier**
   - *Informations du dossier* — invention + besoin PI
   - *Documents* — upload + liste
   - *Checklist* — étapes avant dépôt (revendications, antériorité…)
   - *Parcours PI* → sous-onglets :
     - **Cycle OMPIC** (dépôt → 18 mois → publication)
     - **Rédaction** — sections brevet + *Suggérer brouillon IA* + **Exporter dossier OMPIC**
     - **Revendications** — zone confidentielle
3. **Onglet Analyses IA**
   - Lancer **Nouveauté** ou **FTO** (EPO + OMPIC Maroc + synthèse)
   - Montrer l’**historique** et le rapport PDF
4. **Onglet Échanges**
   - Commentaires, messages dossier, tâches

**À dire :**

> « L’ordre des échanges est visible, mais la **rédaction et les revendications** sont dans un espace dédié, plus confidentiel que le fil de commentaires. »

#### 1.3 Surveillance (≈ 3 min)

**Chemin :** Menu **Surveillance**

**Montrer les 3 onglets :**

1. **Portefeuille** — ajouter une marque enregistrée (ex. « Coca-Cola », classes Nice 32)
2. **Scanner OMPIC** — attendre les alertes (données réelles search.ompic.ma)
3. **Alertes** — traiter une alerte :
   - *Vu — à suivre* = notée sans action
   - *Opposition lancée* = procédure OMPIC engagée
   - *Faux positif* = pas de conflit réel
4. **Veille techno** (optionnel) — mots-clés + IPC, scan manuel

**À dire :**

> « La surveillance interroge le portail OMPIC en direct. Les alertes permettent au CPI de suivre les oppositions sur la fenêtre de publication (~2 mois pour les marques). »

---

### Partie 2 — CPI : revue & pilotage (5 min)

**Déconnexion → Connexion :** `kimbiriaminata16@gmail.com`

#### 2.1 Accueil CPI

- Dossiers assignés, Kanban, rapports

#### 2.2 Ouvrir le même dossier brevet

**Chemin :** Dossiers → sélectionner le projet

**Montrer :**

1. En-tête avec **nom du porteur**
2. **Changement de statut** (ex. `in_review` → `cpi_review`)
3. Onglet **Dossier** — validation checklist, Parcours PI (édition cycle, rédaction, revendications)
4. Onglet **Échanges** — commentaires **juridiques**, messages, création de **tâches** pour le porteur
5. **Avis expert** (si une recommandation existe)

#### 2.3 Projet **Marque**

**Montrer :**

- Parcours PI → **Cycle marque OMPIC** : Déposé → Publié (2 mois) → Enregistré → Surveillance active
- Passer le statut à **Publié** → rappel échéance opposition
- Surveillance → scan marque « Coca-Cola » → alertes similarité réelles

**À dire :**

> « Marque et brevet n’ont pas le même calendrier : **2 mois** pour l’opposition vs **18 mois** pour la publication brevet. La plateforme reflète cette différence. »

#### 2.4 Kanban CPI

**Chemin :** Kanban — vue pipeline des dossiers par statut

---

### Partie 3 — Sécurité & conformité (3 min)

**Connexion porteur ou CPI**

**Chemin :** `/dashboard/security` (porteur) ou équivalent selon rôle

**Montrer :**

- Email confirmé obligatoire
- **2FA TOTP** (activation recommandée pour CPI)
- Rappeler : **RLS Supabase** — chaque utilisateur n’accède qu’à ses dossiers

**À dire :**

> « Avant le dépôt, les informations d’invention sont sensibles. On a renforcé l’accès au-delà du simple mot de passe, et les données sont isolées par projet et par rôle. »

---

### Partie 4 — Préparer dépôt & clôture (2 min)

**Menu → Préparer dépôt OMPIC**

- Checklists marque et brevet
- Lien **directompic.ma**
- Rappel : PatentIQ prépare, OMPIC dépose

**À dire :**

> « Une fois le dossier prêt, le CPI exporte le ZIP ou le HTML et dépose sur le portail officiel OMPIC. »

---

### Conclusion (2 min)

**Synthèse à l’oral :**

| Attente encadrante | Réponse PatentIQ |
|--------------------|------------------|
| Systèmes différents marque / brevet | Cycles OMPIC dédiés + checklists par catégorie |
| Surveillance marques & similarité | Watchlist + scan OMPIC live + alertes traitables |
| Veille technologique + FTO | Veille IPC + analyse FTO (EPO + OMPIC MA) |
| Rédaction & revendications confidentielles | Parcours PI + export dossier + ZIP |
| Sécurité renforcée | Email confirmé, 2FA, RLS |
| Préparation dépôt OMPIC | Page Préparer dépôt + directompic.ma |

**Évolutions possibles (hors scope immédiat) :**

1. Historique versions rédaction
2. Similarité visuelle logos

---

## Scénario express (10 min)

Si le temps est court :

1. Connexion porteur → projet brevet → Parcours PI (rédaction + export) — **3 min**
2. Surveillance → scan marque « Coca-Cola » → alertes — **3 min**
3. Connexion CPI → statut + commentaire juridique — **2 min**
4. Analyse IA FTO ou nouveauté — **2 min**

---

## Plan B — si quelque chose bloque

| Problème | Solution |
|----------|----------|
| Analyse IA bloquée en `pending` | Lancer `npm run ai:worker:loop` |
| Erreur SQL onglet Parcours PI | Appliquer migrations 00025–00029 |
| Email non confirmé | Se connecter et valider via lien Supabase |
| EPO ne répond pas | Montrer l’historique d’une analyse déjà `completed` |
| Scan OMPIC lent / vide | Mode `hybrid` dans `.env` ; tester « Coca » ou « Coca-Cola » |
| 2FA non configuré | Expliquer à l’oral, montrer la page sans activer |

---

## Messages clés à retenir

1. **« Les systèmes sont différents »** — la plateforme adapte marque vs brevet, pas un workflow générique unique.
2. **OMPIC** — recherche **live** sur search.ompic.ma (marques) + brevets MA via EPO (pas d’API REST officielle).
3. **Confidentialité** — revendications et rédaction ≠ messagerie libre.
4. **Phase 1 livrée** (dossier, CPI, IA antériorité) + **Phase 2** (surveillance, veille, cycles, export ZIP, sécurité).

---

## Ressources complémentaires

| Document | Contenu |
|----------|---------|
| [ATTENTES_ENCADRANTE_MAPPING.md](./ATTENTES_ENCADRANTE_MAPPING.md) | Attentes → écrans PatentIQ |
| [DEMO_PREP_PRIORITE1.md](./DEMO_PREP_PRIORITE1.md) | Checklist démo marque + brevet |
| [ROADMAP_ATTENTES_ENCADRANTE.md](./ROADMAP_ATTENTES_ENCADRANTE.md) | Attentes détaillées de l’encadrante |
| [VERDICT_J_VEILLE_FTO.md](./VERDICT_J_VEILLE_FTO.md) | Antériorité, FTO, veille |
| [VERDICT_KL_REDACTION.md](./VERDICT_KL_REDACTION.md) | Rédaction, revendications, export |
| [OMPIC_SURVEILLANCE.md](./OMPIC_SURVEILLANCE.md) | Surveillance OMPIC, worker cron |
| [WORKER_AND_DEPLOY.md](./WORKER_AND_DEPLOY.md) | Worker IA, déploiement Vercel |
| [DIAGRAMMES_UML.md](./DIAGRAMMES_UML.md) | Architecture pour le rapport |
| [RAPPORT_STAGE.md](./RAPPORT_STAGE.md) | Rapport complet du stage |

---

## Après la démo — questions fréquentes

**« Est-ce connecté à l’OMPIC ? »**  
> Oui pour les **marques** : interrogation directe du portail public search.ompic.ma. Pour les **brevets marocains**, index EPO (pa=MA). L’OMPIC ne publie pas d’API REST — ce n’est pas un remplacement de directompic pour le dépôt.

**« Les données sont-elles sécurisées ? »**  
> Auth Supabase, RLS par projet, email confirmé, 2FA disponible. Chiffrement des champs les plus sensibles : prochaine étape.

**« Peut-on déposer directement sur OMPIC ? »**  
> Non — PatentIQ **prépare** le dossier. Le dépôt se fait via **directompic.ma** ; la plateforme suit les étapes et échéances.

**« Quelle est la prochaine priorité ? »**  
> Connexion OMPIC réelle (recherche marques/brevets MA) + export dossier complet pour le CPI.

---

*Document préparé pour la soutenance / démonstration encadrante — PatentIQ, 2026.*
