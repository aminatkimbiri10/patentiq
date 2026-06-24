# Rapport de stage

**PatentIQ — plateforme web d'assistance à la propriété intellectuelle**  
Stage réalisé chez **I2PA** (International Intellectual Property Assistance)

---

## Page de garde

| | |
|---|---|
| **Stagiaire** | [Prénom NOM] |
| **Filière / établissement** | [À COMPLÉTER] |
| **Période** | du [JJ/MM/AAAA] au [JJ/MM/AAAA] — [X] semaines |
| **Structure d'accueil** | I2PA — Lot Massira, Rés. Costa del Sol, Mohammedia, Maroc |
| **Site** | [https://i2pa.com/](https://i2pa.com/) |
| **Encadrante entreprise** | [Prénom NOM, fonction] |
| **Tuteur pédagogique** | [Prénom NOM] |
| **Année universitaire** | [2025–2026] |

---

## Remerciements

Je remercie l'équipe d'**I2PA** de m'avoir intégré dans un contexte où la propriété intellectuelle se vit concrètement : délais OMPIC, différences entre marque et brevet, relation de confiance entre porteur et conseiller.

Ma gratitude va surtout à **[encadrante I2PA]**, qui n'a jamais traité PatentIQ comme un simple « projet informatique ». Chaque retour portait sur le métier : quand lancer une opposition, pourquoi séparer rédaction et messagerie, ce qu'un CPI doit voir en priorité sur son tableau de bord. Sans ces échanges, j'aurais probablement livré une application générique peu crédible devant un professionnel.

Je remercie **[tuteur académique]** pour le cadre pédagogique et la relecture du plan de rapport.

Enfin, merci aux personnes qui ont accepté de tester la plateforme en conditions réelles — deux navigateurs ouverts, un compte porteur et un compte CPI — ce qui a révélé la majorité des problèmes de permissions et de parcours.

---

## Résumé

Au Maroc, protéger une innovation ou une marque implique l'**OMPIC**, des délais réglementaires différents selon le type de titre, et un accompagnement humain par un **conseiller en propriété industrielle (CPI)**. Dans la pratique, les échanges se font souvent par e-mail, les pièces sont dispersées, et les recherches d'antériorité ne restent pas liées au dossier client.

Pendant mon stage chez **I2PA**, j'ai participé au développement de **PatentIQ** : une application web qui **structure** la préparation et le suivi d'un dossier de propriété intellectuelle. PatentIQ ne remplace pas **directompic.ma** ni les portails officiels ; il prépare le travail en amont et le suit après dépôt.

La plateforme couvre quatre rôles (porteur, CPI, expert métier, administrateur), sept catégories de dossiers (brevet, modèle d'utilité, marque, dessin et modèle, secret d'affaires, veille, autre), la collaboration documentaire, des analyses assistées par IA (EPO OPS + Hugging Face), la surveillance des marques via le portail public OMPIC, la veille technologique sur les brevets, ainsi que des parcours PI distincts pour marque, brevet et dessin.

Techniquement, le projet repose sur **Next.js 14**, **TypeScript**, **Supabase** (PostgreSQL, authentification, stockage, RLS), **Tailwind CSS** et **shadcn/ui**. À la clôture du stage, le dépôt compte **32 migrations SQL**, **104 tests unitaires** (Vitest) et des tests **Playwright** pour les parcours critiques.

**Mots-clés :** propriété intellectuelle, OMPIC, brevet, marque, Next.js, Supabase, intelligence artificielle, surveillance, veille technologique, FTO.

---

## Abstract

During my internship at **I2PA** (International Intellectual Property Assistance, Morocco), I contributed to **PatentIQ**, a full-stack web platform for intellectual property case management. The application supports project holders, IP advisors, technical experts and administrators through a shared workspace: documents, checklists, AI-assisted prior-art and FTO analyses, trademark monitoring via the public OMPIC search portal, and technology watch on patent databases.

PatentIQ does not replace official filing on directompic.ma; it structures collaboration before and after official procedures. The stack combines Next.js 14, TypeScript and Supabase with external APIs (EPO Open Patent Services, Hugging Face). The codebase includes 32 SQL migrations and 104 unit tests. Limitations are documented honestly: no public REST API for OMPIC designs, asynchronous AI worker required for analyses, and automated outputs do not replace legal advice.

**Keywords:** intellectual property, OMPIC, patent, trademark, Next.js, Supabase, AI, monitoring.

---

## Liste des acronymes

| Acronyme | Signification |
|----------|---------------|
| CPI | Conseiller en propriété industrielle |
| EPO | Office européen des brevets (European Patent Office) |
| FTO | Freedom to Operate — liberté d'exploitation |
| IA | Intelligence artificielle |
| I2PA | International Intellectual Property Assistance |
| IPC | Classification internationale des brevets |
| LLM | Large Language Model |
| OMPIC | Office marocain de la propriété industrielle et commerciale |
| OPS | Open Patent Services (API EPO) |
| PI | Propriété intellectuelle |
| RLS | Row Level Security (Supabase) |
| RAG | Retrieval-Augmented Generation |

---

# Introduction générale

## Contexte

Avant ce stage, j'avais déjà développé des applications web classiques (formulaires, tableaux, authentification). PatentIQ m'a confronté à un domaine où **la règle métier précède l'écran** : une revendication de brevet n'est pas un commentaire ; une alerte de similarité sur une marque déclenche une fenêtre d'opposition qu'il ne faut pas confondre avec la publication d'un brevet dix-huit mois après le dépôt.

## Problématique

Comment aider un cabinet comme I2PA à **centraliser** le suivi d'un dossier PI — sans prétendre remplacer l'OMPIC — tout en intégrant l'IA de façon **transparente** et **traçable** ?

## Objectifs du stage

1. Comprendre le parcours porteur / CPI / expert au Maroc ;
2. Concevoir et développer PatentIQ par itérations courtes ;
3. Aligner les fonctionnalités sur les retours de l'encadrante ;
4. Tester, documenter et préparer une démonstration de soutenance.

## Méthodologie

J'ai travaillé de manière **incrémentale** : une migration SQL, une Server Action ou un composant React à la fois, validé manuellement avant de passer à la suite. Les validations se faisaient en **double session** (porteur + CPI) et lors de points réguliers avec l'encadrante. La roadmap interne (`docs/ROADMAP_ATTENTES_ENCADRANTE.md`) servait de fil conducteur, sans figer le détail technique.

## Plan du rapport

| Chapitre | Contenu |
|----------|---------|
| Ch. 1 | Présentation de l'entreprise I2PA |
| Ch. 2 | Contexte du projet et analyse de l'existant |
| Ch. 3 | Besoins, acteurs et conception |
| Ch. 4 | Réalisation technique |
| Ch. 5 | Intelligence artificielle et données |
| Ch. 6 | Tests, résultats et perspectives |

---

# Chapitre 1 — Présentation de l'entreprise d'accueil

## 1.1 Identité et positionnement

**I2PA** (*International Intellectual Property Assistance*) est une structure marocaine d'assistance et de conseil en propriété intellectuelle, basée à **Mohammedia**. Sur son site [i2pa.com](https://i2pa.com/), l'organisme se présente avec le slogan *« Protéger, valoriser, innover »* et s'adresse aux entreprises, startups, inventeurs et créateurs, au niveau national et international.

I2PA n'est **pas** un office de dépôt. Le dépôt officiel relève de l'**OMPIC** et du portail **directompic.ma**. I2PA intervient en amont et en aval : stratégie, rédaction, veille, surveillance, contrats.

**Coordonnées publiques (site I2PA)**

| Information | Détail |
|-------------|--------|
| Adresse | Lot Massira, Résidence Costa del Sol, Mohammedia |
| Site | https://i2pa.com/ |
| Contact | Contact@i2pa.com — (+212) 615 539 752 |
| Horaires affichés | Lundi – Vendredi, 09h00 – 18h00 |

## 1.2 Activités observées pendant le stage

Au cours de mes échanges, j'ai constaté que le travail quotidien couvre notamment :

- l'accompagnement au **dépôt** de brevets, marques et dessins ;
- la **rédaction** et la structuration des dossiers avant transmission OMPIC ;
- la **veille** et la **surveillance** des titres déjà obtenus ;
- la relation client (porteur qui ne maîtrise pas toujours le vocabulaire PI).

PatentIQ s'inscrit dans cette logique : outil interne pour **structurer** le dossier numérique, pas pour court-circuiter le CPI.

## 1.3 Encadrement

| Rôle | Contribution |
|------|--------------|
| Encadrante I2PA | Cadrage métier, validation des écrans, priorisation |
| Tuteur académique | Suivi pédagogique, rapport |
| Stagiaire (auteur) | Développement, tests, documentation |

---

# Chapitre 2 — Contexte du projet et analyse de l'existant

## 2.1 Constats de départ

Sans outil dédié, un dossier PI risque de se fragmenter :

- pièces jointes perdues dans des fils de messagerie ;
- antériorités recherchées une fois, sans lien avec le projet ;
- confusion entre **cycle marque** (opposition ~2 mois après publication) et **cycle brevet** (confidentialité, publication ~18 mois) ;
- difficulté pour le CPI d'avoir une **vue portefeuille** de ses clients.

## 2.2 Solutions existantes (limites)

| Solution | Limite pour I2PA |
|----------|------------------|
| E-mail + cloud générique | Pas de workflow PI, pas de rôles, pas de traçabilité |
| Espacenet / bases EPO | Consultation externe, non intégrée au dossier client |
| Logiciels PI enterprise | Coût et complexité disproportionnés pour un cabinet |
| Portails OMPIC | Dépôt et recherche publique, pas de collaboration porteur–CPI |

PatentIQ vise un **juste milieu** : web app légère, hébergeable (Vercel + Supabase free tier), orientée parcours marocain.

## 2.3 Retour déterminant de l'encadrante

Lors d'un point de suivi, l'encadrante a insisté sur une idée simple que j'ai tardé à prendre au sérieux au début : *« Les systèmes sont différents par rapport aux produits. »*  
Concrètement : une marque ne se gère pas comme un brevet. Cette phrase a orienté la conception des **cycles PI séparés**, des **checklists par catégorie** et des **libellés adaptés** (par exemple « description de la marque » plutôt que « résumé de l'invention » pour un dossier marque).

---

# Chapitre 3 — Analyse des besoins et conception

## 3.1 Acteurs et rôles

PatentIQ distingue **quatre rôles** applicatifs (table `roles`, seed `supabase/seed.sql`) :

| Rôle (code) | Interface | Missions principales |
|-------------|-----------|----------------------|
| `project_holder` | `/dashboard` | Créer des dossiers, déposer des documents, lancer des analyses, suivre l'avancement |
| `cpi_advisor` | `/cpi` | Dossiers assignés, changement de statut, Kanban, surveillance portefeuille, rapports |
| `expert` | `/expert` | Avis technique, recommandations structurées sur dossiers assignés |
| `admin` | `/admin` | Utilisateurs, projets globaux, paramètres workflow, journaux d'audit |

## 3.2 Catégories de dossiers

Sept catégories sont prévues en base :

1. Brevet d'invention  
2. Modèle d'utilité  
3. Marque  
4. Dessin et modèle  
5. Secret d'affaires  
6. Veille et liberté d'exploitation  
7. Autre  

Chaque catégorie embarque une **checklist** métier (`src/lib/checklists/templates.ts`) et, le cas échéant, un **parcours PI** dédié.

## 3.3 Besoins fonctionnels retenus

| Besoin | Réponse PatentIQ |
|--------|------------------|
| Espace dossier partagé | Projet avec onglets Dossier / Échanges / Analyses IA |
| Traçabilité | Historique statuts, audit logs, notifications |
| Antériorité / FTO assistées | EPO OPS + synthèse Hugging Face |
| Surveillance marques | Recherche live sur search.ompic.ma + watchlist |
| Veille brevets | Mots-clés + scan EPO périodique |
| Rédaction brevet | Sections OMPIC + brouillon IA + export HTML/ZIP |
| Revendications | Zone dédiée, distincte des commentaires |
| Cycles marque / brevet / dessin | Panneaux lifecycle dans Parcours PI |
| Échéances | Rappels opposition marque et publication brevet |
| Sécurité | Email confirmé, 2FA TOTP, RLS Supabase |

## 3.4 Besoins non fonctionnels

- **Performance** : navigation App Router, chargements progressifs ;
- **Sécurité** : isolation des dossiers par RLS ; champs sensibles (revendications) séparés des échanges libres ;
- **Honnêteté produit** : distinguer mode live, stub et hybrid pour OMPIC ; ne pas simuler ce qui n'existe pas côté API ;
- **Maintenabilité** : TypeScript strict, tests Vitest, documentation dans `docs/`.

## 3.5 Architecture générale

```
[Navigateur]
    ↓ HTTPS
[Next.js 14 — App Router]
    ├── Server Components / Server Actions
    ├── Routes API (/api/ai/*, /api/surveillance/*)
    └── Middleware auth + email confirmé
    ↓
[Supabase]
    ├── PostgreSQL + RLS (32 migrations)
    ├── Auth (email, OAuth, MFA)
    └── Storage (documents, avatars)
    ↓
[Services externes]
    ├── EPO OPS (brevets, dont filtre pn=MA pour publications marocaines)
    ├── Hugging Face (synthèse, chat, brouillon)
    └── search.ompic.ma (marques — portail public)
```

Les diagrammes détaillés (cas d'utilisation, séquences IA, surveillance) sont dans `docs/DIAGRAMMES_UML.md`.

---

# Chapitre 4 — Réalisation et implémentation

## 4.1 Stack technique

| Couche | Technologie | Version / remarque |
|--------|-------------|-------------------|
| Frontend | Next.js, React, TypeScript | 14.2.21 |
| UI | Tailwind CSS, shadcn/ui, Lucide | Composants accessibles |
| Backend | Server Actions, Route Handlers | Pas de serveur Node séparé |
| Base | Supabase PostgreSQL | 32 fichiers dans `supabase/migrations/` |
| Auth | Supabase Auth | Rôles, MFA TOTP |
| Fichiers | Supabase Storage | PDF, images — limite 50 Mo (`src/config/constants.ts`) |
| Tests | Vitest, Playwright | 104 tests unitaires au closing |
| IA externe | EPO OPS, Hugging Face | Clés dans `.env.local` |

## 4.2 Organisation du code

| Dossier | Rôle |
|---------|------|
| `src/app/` | Routes : public, auth, dashboard, cpi, expert, admin |
| `src/lib/actions/` | Server Actions (projets, documents, watchlist, etc.) |
| `src/lib/ai/` | Pipeline analyses, worker, providers EPO/HF |
| `src/lib/surveillance/` | OMPIC provider, scan watchlist, veille techno |
| `src/lib/workflow/` | Cycles marque/brevet/dessin, échéances, statuts |
| `src/components/` | UI métier (dossier, surveillance, CPI…) |
| `docs/` | Guides démo, UML, déploiement |

## 4.3 Phases de développement (rétrospective)

### Phase 1 — Socle collaboratif

- Authentification, onboarding rôle, profil ;
- CRUD projets, documents, commentaires, messages, tâches ;
- Checklist par catégorie ;
- Premières analyses IA (nouveauté) via EPO OPS ;
- Espace CPI (dossiers assignés, changement de statut).

*Difficulté personnelle :* comprendre Supabase RLS — une policy mal écrite bloquait l'insertion projet pendant deux jours (`00021_fix_projects_insert_rls.sql`).

### Phase 2 — Attentes encadrante

- Surveillance : watchlist, alertes, scanner marques OMPIC ;
- Veille technologique (mots-clés, IPC, cron hebdo) ;
- Rédaction brevet (5 sections) + revendications + export dossier ;
- Cycles de vie marque et brevet avec rappels d'échéances ;
- Kanban CPI, rapports, 2FA.

*Retour terrain :* la surveillance marque fonctionne en **live** sur search.ompic.ma ; en revanche l'OMPIC ne publie pas d'API REST ouverte — d'où les modes `stub`, `proxy` (n8n) et `hybrid` documentés dans `docs/OMPIC_SURVEILLANCE.md`.

### Phase 3 — Consolidation

- FTO, similarité, classification IA ;
- Fiche opposition, historique rédaction ;
- Parcours **dessin et modèle** (cycle dossier, sans scan automatique — voir §5.3) ;
- UX : libellés adaptés marque/brevet, suppression dossier par le porteur, déconnexion visible tous rôles ;
- Robustesse : correction filtre EPO Maroc (`pn=MA` au lieu de `pa=MA`), tests étendus.

## 4.4 Fonctionnalités livrées (inventaire factuel)

### Porteur (`/dashboard`)

- Tableau de bord, projets, création dossier avec catégorie ;
- Détail projet : documents (upload, OCR local Tesseract), checklist, Parcours PI ;
- Analyses IA : nouveauté, FTO, sémantique, similarité, résumé, classification ;
- Assistant conversationnel (contexte dossier) ;
- Surveillance, préparation dépôt OMPIC, messages, notifications, profil, sécurité.

### CPI (`/cpi`)

- Accueil, dossiers assignés, Kanban, rapports (export CSV/HTML) ;
- Même surveillance et préparation dépôt, vue portefeuille clients ;
- Commentaires juridiques, tâches, validation cycles PI.

### Expert et admin

- Expert : recommandations sur dossiers assignés ;
- Admin : utilisateurs, rôles, paramètres workflow (auto-assign CPI), audit.

## 4.5 Workflow statuts projet

Neuf statuts sont gérés (`src/config/constants.ts`) : Brouillon → Soumis → En revue → Documents attendus → Revue expert → Revue CPI → Approuvé / Rejeté / Clôturé.

Les transitions sont **filtrées par rôle** (`src/lib/workflow/status-permissions.ts`) pour év qu'un porteur passe seul un dossier en « Approuvé ».

---

# Chapitre 5 — Intelligence artificielle et traitement des données

## 5.1 Pipeline analyses IA

1. Le porteur ou le CPI lance une analyse depuis l'onglet **Analyses IA** ;
2. Une entrée `ai_searches` passe en `pending` ;
3. Le worker (`npm run ai:worker:loop` ou cron GitHub Actions) appelle `/api/ai/worker` ;
4. Résultats stockés en base + synthèse textuelle (Hugging Face ou template de secours).

**Point honnête :** sans worker actif, les analyses restent bloquées en `pending`. C'est documenté dans le README et le guide démo — ce n'est pas un bug caché.

## 5.2 Sources de données

| Analyse | Sources réelles |
|---------|-----------------|
| Brevets internationaux | EPO OPS — endpoint `published-data/search/biblio` |
| Brevets publications MA | EPO OPS avec filtre **`pn=MA`** (numéro de publication marocain) |
| Marques (antériorité) | Portail search.ompic.ma |
| Synthèse / chat / brouillon | Hugging Face (modèle configurable, ex. Qwen2.5-7B-Instruct) |
| OCR | Tesseract.js — exécution **locale navigateur**, sans coût API |

## 5.3 Incident réel corrigé — recherche EPO Maroc

Lors d'une analyse FTO sur un dossier « veste », la synthèse affichait une note d'erreur : *recherche EPO indisponible (404)*. En investiguant, j'ai découvert que le code utilisait **`pa=MA`**, alors qu'en langage CQL EPO le champ **`pa`** désigne le **déposant**, pas le pays. Le filtre correct pour les publications marocaines est **`pn=MA`**.

Après correction (`src/lib/ai/providers/epo-ops.ts`) et tests (`tests/epo-ops.test.ts`), la même requête retourne des brevets MA valides. J'ai aussi séparé les appels EPO global et EPO Maroc pour qu'un échec partiel n'invalide pas toute l'analyse.

## 5.4 Dessins et modèles — choix assumé

Nous avons exploré plusieurs pistes (EPO designs, EUIPO, comparaison d'images) et constaté :

- pas d'API publique OMPIC pour les dessins (les URLs testées sur search.ompic.ma renvoient 404) ;
- EPO OPS ne propose pas de recherche dessins enregistrés comparable aux marques ;
- une simulation ou un stub permanent serait trompeur en démo.

**Décision retenue :** PatentIQ gère le **cycle dossier** dessin (dépôt → examen → publication → enregistrement → surveillance manuelle) avec liens vers ompic.ma et directompic.ma, sans moteur de scan automatique. L'antériorité visuelle reste une tâche CPI sur les portails officiels.

## 5.5 Limites de l'IA dans PatentIQ

- Les synthèses sont **indicatives** ; le prompt rappelle qu'elles ne remplacent pas un avis juridique ;
- La couverture OMPIC brevets passe par l'index EPO (`pn=MA`), pas par une API OMPIC directe ;
- Le tier gratuit Hugging Face peut imposer de la latence ; un fallback template existe (`src/lib/ai/llm-client.ts`).

---

# Chapitre 6 — Tests, validation et perspectives

## 6.1 Stratégie de tests

| Type | Outil | Périmètre |
|------|-------|-----------|
| Unitaires | Vitest — **104 tests**, 32 fichiers | CQL EPO, cycles PI, checklist, similarité logo, export ZIP… |
| E2E | Playwright | `e2e/demo-paths.spec.ts`, `e2e/smoke.spec.ts` |
| Manuel | Double session porteur/CPI | Permissions, parcours démo (`docs/DEMO_ENCADRANTE.md`) |

Commandes :

```bash
npm test
npm run test:e2e
npm run typecheck
npm run build
```

## 6.2 Validation métier

La validation s'est faite par :

- démonstrations iteratives devant l'encadrante ;
- scénarios marque + brevet documentés dans `docs/DEMO_PREP_PRIORITE1.md` ;
- comparaison avec le mapping attentes → écrans (`docs/ATTENTES_ENCADRANTE_MAPPING.md`).

Comptes de test documentés pour la démo : porteur `aminatkimbiri@gmail.com`, CPI `kimbiriaminata16@gmail.com` (mots de passe hors dépôt).

## 6.3 Résultats

| Critère | État à la clôture |
|---------|-------------------|
| Parcours porteur → CPI | Opérationnel |
| Analyses IA (avec worker) | Opérationnel |
| Surveillance marques live | Opérationnel (mode hybrid recommandé) |
| Veille techno | Opérationnel si clés EPO configurées |
| Rédaction + export brevet | Opérationnel |
| Cycle dessin | Cycle dossier oui ; scan auto non |
| Déploiement | Documenté Vercel + Supabase (`docs/WORKER_AND_DEPLOY.md`) |

## 6.4 Difficultés rencontrées (synthèse personnelle)

1. **RLS Supabase** — erreurs silencieuses côté client ; solution : policies explicites + migrations correctives.  
2. **OMPIC sans API** — recherche marque via portail public ; brevets MA via EPO ; pas de raccourci magique.  
3. **Worker IA asynchrone** — oubli fréquent en démo ; scripts `ai:worker:loop` obligatoires en local.  
4. **CQL EPO** — confusion `pa` / `pn` ; apprentissage de la doc OPS v3.2.  
5. **Périmètre dessins** — abandon du faux automatisme au profit d'un message honnête à l'utilisateur.

## 6.5 Perspectives

| Piste | Intérêt |
|-------|---------|
| Proxy n8n OMPIC | Industrialiser la recherche si partenariat ou scraping encadré |
| Versioning rédaction | Historique comparatif des sections brevet |
| Notifications e-mail | Resend déjà prévu dans `.env.example` |
| API OMPIC future | Brancher directement si l'office publie un accès officiel |
| Renforcement tests E2E | Parcours authentifiés CI avec secrets Playwright |

---

# Conclusion générale

Ce stage m'a permis de livrer **PatentIQ**, une plateforme cohérente avec la pratique d'un cabinet PI marocain : collaboration multi-rôles, cycles différenciés marque/brevet/dessin, IA transparente et surveillance marques sur une source réelle.

Le résultat le plus important pour moi n'est pas une ligne de code, but la prise de conscience que **le métier contraint l'architecture**. Une fonctionnalité « évidente » côté développeur (un seul workflow pour tous les titres PI) devient inacceptable côté CPI.

PatentIQ reste un **MVP crédible** : des limites sont connues et documentées plutôt que masquées. La suite logique est la mise en production encadrée (Vercel, workers, monitoring) et l'enrichissement progressif selon les retours I2PA et l'évolution des portails OMPIC.

---

# Bibliographie et webographie

## Ouvrages et références institutionnelles

- OMPIC — Office marocain de la propriété industrielle et commerciale : [https://www.ompic.ma/](https://www.ompic.ma/)
- Portail de dépôt : [https://directompic.ma/](https://directompic.ma/)
- EPO — Open Patent Services documentation v3.2 : [https://developers.epo.org/](https://developers.epo.org/)

## Ressources techniques

- Next.js 14 documentation : [https://nextjs.org/docs](https://nextjs.org/docs)
- Supabase documentation : [https://supabase.com/docs](https://supabase.com/docs)
- Hugging Face Inference API : [https://huggingface.co/docs](https://huggingface.co/docs)

## Documentation projet (dépôt PatentIQ)

| Document | Contenu |
|----------|---------|
| `README.md` | Installation, stack, IA |
| `docs/DIAGRAMMES_UML.md` | UML, Gantt, séquences |
| `docs/DEMO_ENCADRANTE.md` | Script démo 18 min |
| `docs/OMPIC_SURVEILLANCE.md` | Architecture surveillance |
| `docs/AI_PROVIDERS.md` | Configuration EPO / HF |
| `docs/WORKER_AND_DEPLOY.md` | Worker et déploiement |

---

# Annexes

## Annexe A — Migrations SQL (liste)

Fichiers présents dans `supabase/migrations/` au closing :

`00001_extensions.sql` à `00032_drop_project_commercialization.sql` (32 fichiers).

Migrations structurantes pour la démo :

- `00025_surveillance_claims.sql` — watchlist, alertes, revendications  
- `00026_veille_commercialization.sql` — veille techno  
- `00027_patent_drafts.sql` — rédaction brevet  
- `00028_watchlist_portfolio.sql` — portefeuille surveillance  
- `00029_ai_search_fto.sql` — type analyse FTO  
- `00031_design_surveillance.sql` — métadonnées cycle dessin  
- `00032_drop_project_commercialization.sql` — retrait module valorisation  

## Annexe B — Commandes utiles

```bash
# Développement
npm install
npm run dev

# Worker IA (terminal séparé)
npm run ai:worker:loop

# Base de données
npm run db:push

# Qualité
npm test
npm run typecheck
npm run build
```

## Annexe C — Variables d'environnement (extrait)

Voir `.env.example` :

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `EPO_OPS_CONSUMER_KEY`, `EPO_OPS_CONSUMER_SECRET`
- `HUGGINGFACE_API_KEY`
- `OMPIC_SEARCH_MODE` (`live` | `stub` | `proxy` | `hybrid`)
- `AI_WORKER_SECRET`

## Annexe D — Captures d'écran suggérées pour le dossier PDF

1. Tableau de bord porteur avec widget échéances  
2. Détail dossier brevet — Parcours PI (rédaction + revendications)  
3. Analyse FTO — historique avec sources EPO  
4. Surveillance — scan marque et alertes  
5. Vue CPI — Kanban et changement de statut  
6. Page sécurité — 2FA  

*(Insérer les captures réelles lors de la mise en forme Word/PDF.)*

---

*Rapport rédigé par [Prénom NOM] — stage I2PA / PatentIQ — [mois année].*  
*Code source et documentation technique : dépôt `patent-platform` (Next.js 14 + Supabase).*
