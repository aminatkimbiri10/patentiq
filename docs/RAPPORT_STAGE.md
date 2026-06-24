# Rapport de stage

---

**[Prénom NOM]**  
Étudiant(e) en [filière] — [Nom de l'école]  
Promotion [année]

**Stage du [date début] au [date fin]**  
Durée : [X] semaines

**Structure d'accueil :** I2PA — International Intellectual Property Assistance  
**Site :** [https://i2pa.com/](https://i2pa.com/)  
**Siège :** Lot Massira, Rés. Costa del Sol, Mohammedia, Maroc  
**Encadrante :** [Prénom NOM]  
**Tuteur pédagogique :** [Prénom NOM]

---

## Table des matières

> **Modèle officiel à suivre** (avec chapitre dédié « Présentation de l'entreprise ») :  
> [`docs/RAPPORT_MODELE_OFFICIEL.md`](./RAPPORT_MODELE_OFFICIEL.md)  
> Rédaction détaillée existante : [`docs/RAPPORT_STAGE_REDACTION.md`](./RAPPORT_STAGE_REDACTION.md)

### Structure recommandée (modèle école)

**Pages préliminaires** — Page de garde · Remerciements · Résumé · Abstract · Acronymes · Figures · Tableaux · TOC

**Introduction générale**

| Chapitre | Titre |
|----------|-------|
| **Ch. 1** | **Présentation de l'entreprise** (I2PA) |
| Ch. 2 | Contexte du projet et analyse de l'existant |
| Ch. 3 | Analyse des besoins et conception |
| Ch. 4 | Réalisation et implémentation |
| Ch. 5 | Intelligence artificielle et valorisation des données |
| Ch. 6 | Tests, résultats et perspectives |

**Conclusion générale** · Bibliographie · Webographie · Annexes

---

### Ancienne table (contenu détaillé ci-dessous)

1. [Remerciements](#remerciements)
2. [Résumé](#résumé)
3. [Introduction](#introduction)
4. [Chapitre 1 — Présentation de l'organisme d'accueil](#chapitre-1--présentation-de-lorganisme-daccueil)
5. [Chapitre 2 — Contexte, problématique et objectifs](#chapitre-2--contexte-problématique-et-objectifs)
6. [Chapitre 3 — Analyse de l'existant et besoins](#chapitre-3--analyse-de-lexistant-et-besoins)
7. [Chapitre 4 — Conception du système](#chapitre-4--conception-du-système)
8. [Chapitre 5 — Réalisation](#chapitre-5--réalisation)
9. [Chapitre 6 — Tests et validation](#chapitre-6--tests-et-validation)
10. [Chapitre 7 — Difficultés rencontrées](#chapitre-7--difficultés-rencontrées)
11. [Chapitre 8 — Bilan et compétences acquises](#chapitre-8--bilan-et-compétences-acquises)
12. [Conclusion et perspectives](#conclusion-et-perspectives)
13. [Bibliographie](#bibliographie)
14. [Annexes](#annexes)

---

## Remerciements

Je tiens à remercier l'équipe d'**I2PA** (International Intellectual Property Assistance) de m'avoir accueilli dans un environnement où la propriété intellectuelle n'est pas un simple thème théorique, but une pratique quotidienne auprès de porteurs de projets marocains et internationaux.

Ma reconnaissance va particulièrement à **[prénom nom de l'encadrante]**, qui m'a guidé pendant **[X] semaines** avec patience et exigence. À mon arrivée, je confondais brevet, marque et dessin industriel ; je ne comprenais pas pourquoi une marque se surveille dans un catalogue OMPIC alors qu'un brevet attend dix-huit mois avant publication. Ses explications concrètes — dossiers réels, délais, rôle du CPI — ont orienté directement le développement de PatentIQ.

La **réunion de suivi** reste une étape déterminante. Sa remarque — *« Les systèmes sont différents par rapport aux produits »* — m'a évité de coder une application générique où marque et brevet suivraient le même parcours. Cette phrase a structuré des semaines de travail : cycles distincts, checklists séparées, surveillance adaptée à chaque type de titre.

Je remercie **[tuteur académique]** pour le suivi pédagogique, la relecture du plan et l'incitation à produire une documentation exploitable (UML, Gantt, rapport).

Enfin, merci à toutes les personnes qui ont testé PatentIQ en **double session** — un navigateur porteur, un navigateur CPI. C'est ainsi que la plupart des bugs de permissions et de navigation ont été détectés.

---

## Résumé

La propriété intellectuelle (PI) regroupe des démarches longues et sensibles : décrire une innovation, prouver sa nouveauté, collaborer avec un conseil en propriété industrielle (CPI), respecter des échéances réglementaires, puis surveiller son titre une fois obtenu. Au Maroc, ces étapes passent par l'**OMPIC** et le portail **directompic.ma**. En pratique, porteurs et CPI échangent souvent par email, stockent des PDF dans des dossiers mal nommés et effectuent des recherches d'antériorité sans lien avec le dossier client.

Pendant mon stage chez **I2PA**, j'ai participé au développement de **PatentIQ**, plateforme web full-stack qui centralise la préparation et le suivi d'un dossier PI. L'application ne remplace pas le dépôt officiel : elle structure la collaboration multi-acteurs, la checklist par type de titre, les analyses d'antériorité assistées par IA, la surveillance post-enregistrement et la veille technologique.

Mon travail s'est déroulé en **trois phases**. La **Phase 1** posait le socle : authentification multi-rôles, projets, documents versionnés, checklist, messagerie, tâches, notifications, espace CPI (Kanban), analyses IA asynchrones (EPO OPS + Hugging Face), assistant conversationnel et interface responsive. La **Phase 2**, alignée sur les attentes de mon encadrante, a ajouté la surveillance OMPIC (watchlist, alertes, recherche marque), la veille technologique, la rédaction structurée de brevet, l'éditeur de revendications, les cycles de vie marque (~2 mois d'opposition) et brevet (~18 mois de publication), les rappels d'échéances PI, la sécurité renforcée (email confirmé, 2FA TOTP) et une refonte UI professionnelle. La **Phase 3** a consolidé la crédibilité métier (checklist auto, fiche opposition, historique rédaction, analyse FTO), l'expérience utilisateur (onboarding, performance navigation), la robustesse (health check, cache OMPIC, tests E2E) et l'extension aux **dessins et modèles**.

Techniquement, PatentIQ repose sur **Next.js 14**, **TypeScript**, **Supabase** (PostgreSQL + RLS + Auth + Storage), **Tailwind CSS** et **shadcn/ui**. À la fin du stage : **32 migrations SQL**, **84 tests unitaires** Vitest, **3 tests E2E** Playwright, documentation de démo, diagrammes UML/Gantt et guide de déploiement Vercel.

**Mots-clés :** propriété intellectuelle, OMPIC, brevet, marque, dessin et modèle, Next.js, Supabase, workflow, intelligence artificielle, antériorité, surveillance, veille technologique.

---

## Introduction

### Contexte du stage

Je suis étudiant(e) en **[filière]** à **[école]**. Avant ce stage, mon expérience web couvrait surtout des applications CRUD classiques. PatentIQ m'a confronté à un domaine où **le métier contraint le code** : qui peut lire une revendication, quand une alerte de similarité doit notifier le CPI assigné, pourquoi une marque et un brevet ne partagent pas la même timeline.

### Objectifs

PatentIQ vise à **préparer et suivre** un dossier PI dans un espace partagé, traçable et sécurisé. Mes missions :

1. Comprendre le parcours porteur / CPI / expert au Maroc ;
2. Consolider la Phase 1 (collaboration, IA, espace CPI) ;
3. Implémenter la Phase 2 selon la roadmap encadrante ;
4. Finaliser la Phase 3 (robustesse, perf, dessins & modèles) ;
5. Documenter et préparer la démonstration de soutenance.

### Méthodologie

J'ai adopté une approche **incrémentale** : une migration SQL, une Server Action ou un composant à la fois, testé avant de passer au suivant. Chaque livraison était validée manuellement en double session (porteur + CPI) et discutée avec l'encadrante. La roadmap `ROADMAP_ATTENTES_ENCADRANTE.md` servait de fil conducteur.

| Phase | Période indicative | Objectif |
|-------|-------------------|----------|
| Phase 1 — Socle | Sem. 1–10 | Collaboration, IA, CPI |
| Phase 2 — Attentes encadrante | Sem. 11–21 | Surveillance, rédaction, cycles PI, sécurité |
| Phase 3 — Finitions | Sem. 22–24 | Opposition, dessins, perf, E2E |
| Livrables | Sem. 24 | Rapport, UML, démo, soutenance |

---

## Chapitre 1 — Présentation de l'organisme d'accueil

### 1.1 I2PA en bref

**I2PA** (*International Intellectual Property Assistance*) est une structure marocaine d'assistance et de conseil en propriété intellectuelle, basée à **Mohammedia**. Son slogan — *« Protéger, valoriser, innover »* — reflète une mission centrée sur la protection et l'exploitation stratégique des actifs immatériels.

L'organisme accompagne inventeurs, startups, chercheurs et entreprises sur :

- les **brevets d'invention** ;
- les **marques** ;
- les **dessins et modèles industriels** ;
- les **droits d'auteur** ;
- les **contrats** et accords de licence ;
- des services complémentaires (formation, e-datage, valorisation du patrimoine marocain).

I2PA communique en français, anglais et arabe, et interagit régulièrement avec l'écosystème **OMPIC** (*Office marocain de la propriété industrielle et commerciale*).

### 1.2 Cadre du stage

Mon stage s'inscrivait dans le développement de **PatentIQ**, outil interne destiné à structurer le travail entre porteurs de projets et conseillers CPI. L'objectif n'était pas de remplacer l'expertise humaine, but de lui fournir un **espace numérique** cohérent avec la pratique I2PA et les spécificités marocaines.

### 1.3 Encadrement

| Rôle | Mission |
|------|---------|
| Encadrante I2PA | Retours métier, validation fonctionnelle, réunions de suivi |
| Tuteur académique | Suivi pédagogique, structure du rapport |
| Stagiaire | Développement, tests, documentation |

---

## Chapitre 2 — Contexte, problématique et objectifs

### 2.1 Enjeux de la propriété intellectuelle au Maroc

Déposer un brevet ou une marque au Maroc implique de respecter des procédures OMPIC précises. Une **marque** est publiée pendant environ **deux mois** pour permettre les oppositions ; un **brevet** reste généralement **confidentiel pendant dix-huit mois** avant publication. Ces délais ne sont pas des détails administratifs : ils conditionnent les actions du CPI (surveiller le catalogue marques, préparer une opposition, anticiper la publication brevet).

Par ailleurs, la PI ne s'arrête pas au dépôt. Le CPI doit **surveiller** les titres similaires et mener une **veille technologique** continue sur l'état de l'art — des activités chronophages lorsqu'elles reposent sur des recherches manuelles éparpillées.

### 2.2 Problématique

**Comment centraliser, dans un outil web sécurisé, la préparation d'un dossier PI marocain — de l'idée initiale à la surveillance post-enregistrement — tout en respectant les différences métier entre marque, brevet et dessin & modèle ?**

### 2.3 Objectifs fonctionnels

| Objectif | Description |
|----------|-------------|
| O1 | Espace collaboratif porteur / CPI / expert / admin |
| O2 | Checklist et documents adaptés au type de dossier |
| O3 | Recherche d'antériorité assistée par IA (EPO, OMPIC) |
| O4 | Surveillance OMPIC et veille technologique |
| O5 | Rédaction brevet et revendications confidentielles |
| O6 | Cycles de vie marque / brevet / dessin distincts |
| O7 | Rappels d'échéances PI et fiche opposition |
| O8 | Sécurité : RLS, email confirmé, 2FA |

### 2.4 Périmètre exclu

- Dépôt officiel sur directompic.ma (hors scope) ;
- Avis juridique automatisé (l'IA assiste, le CPI décide) ;
- Module de valorisation commerciale (initialement envisagé, retiré pour concentrer l'outil sur le parcours PI core).

---

## Chapitre 3 — Analyse de l'existant et besoins

### 3.1 Outils génériques vs besoins PI

Les outils collaboratifs classiques (email, Drive, Notion) ne modélisent pas :

- les **transitions de statut** d'un dossier PI ;
- la **confidentialité** des revendications ;
- les **échéances réglementaires** (opposition, publication) ;
- la **surveillance** post-enregistrement.

I2PA commercialise des services distincts (marques vs brevets vs dessins) parce que les **procédures OMPIC** diffèrent. Un outil PI crédible doit refléter cette distinction.

### 3.2 Retours de l'encadrante (réunion de suivi)

Les attentes clés, documentées dans `ROADMAP_ATTENTES_ENCADRANTE.md`, peuvent se résumer ainsi :

| Thème | Attente encadrante | Traduction technique |
|-------|-------------------|---------------------|
| Produits PI distincts | Marque ≠ brevet ≠ dessin | Cycles, checklists et types watchlist séparés |
| Surveillance marque | Détecter similarités catalogue OMPIC | Watchlist + alertes + fiche opposition |
| Veille techno | Garder l'œil sur l'état de l'art | `ip_tech_watch` + scan EPO périodique |
| Rédaction | Sections confidentielles OMPIC | `patent_drafts` + revendications |
| Sécurité | Protéger le dossier avant dépôt | RLS, 2FA, email confirmé |
| Échéances | 2 mois (marque), 18 mois (brevet) | `ip-deadlines` + notifications |

### 3.3 Acteurs et cas d'usage

#### Porteur de projet (`project_holder`)

Crée un dossier, dépose des documents, coche la checklist, lance des analyses IA, consulte le Parcours PI et gère sa watchlist surveillance. Espace : `/dashboard`.

#### Conseiller CPI (`cpi_advisor`)

Pilote les dossiers assignés via Kanban, change les statuts, commente juridiquement, assigne des tâches, édite cycles et rédaction, surveille les alertes. Espace : `/cpi`.

#### Expert (`expert`)

Intervient sur les dossiers en `expert_review`, dépose un avis structuré. Espace : `/expert`.

#### Administrateur (`admin`)

Gère utilisateurs, projets globaux et logs d'audit. Espace : `/admin`.

### 3.4 Scénario type — brevet « gourde filtrante »

1. Marie (porteur) crée un projet brevet, upload une description PDF.
2. Elle lance une analyse IA nouveauté ; le worker interroge EPO OPS et produit une synthèse.
3. Elle soumet le dossier ; Jean (CPI) reçoit une notification.
4. Jean demande une pièce, crée une tâche, passe le statut en `cpi_review` puis `approved`.
5. Dans Parcours PI, ils complètent rédaction et revendications.
6. Jean avance le cycle brevet (déposé → attente publication 18 mois).
7. Marie ajoute le titre à la watchlist ; une alerte déclenche une fiche opposition si pertinent.

### 3.5 Scénario type — marque

1. Porteur crée un projet marque.
2. CPI fait avancer le cycle : déposé → publié (2 mois) → enregistré → surveillance active.
3. Scan OMPIC détecte une similarité → alerte → notification porteur + CPI.
4. CPI prépare une opposition via la fiche dédiée sur l'alerte.

---

## Chapitre 4 — Conception du système

### 4.1 Architecture globale

```
┌──────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Navigateur  │────►│  Next.js 14              │────►│  Supabase       │
│  React UI    │     │  Server Actions + API    │     │  PostgreSQL RLS │
└──────────────┘     └────────────┬─────────────┘     │  Auth · Storage │
                                  │                   └─────────────────┘
                                  ▼
                     ┌──────────────────────────┐
                     │  APIs externes           │
                     │  EPO OPS · Hugging Face  │
                     │  OMPIC (live/stub/proxy) │
                     └──────────────────────────┘
                                  ▲
                     ┌────────────┴─────────────┐
                     │  Workers                 │
                     │  IA · Surveillance (cron)│
                     └──────────────────────────┘
```

**Stack technique :**

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 App Router, React, TypeScript, Tailwind, shadcn/ui |
| Backend | Server Actions, Route Handlers API |
| Base de données | Supabase PostgreSQL + RLS |
| Auth | Supabase Auth (email, 2FA TOTP) |
| Stockage | Supabase Storage (bucket `project-documents`) |
| IA | EPO OPS (brevets), Hugging Face Qwen2.5 (synthèse, chat, brouillon) |
| Surveillance | Provider OMPIC (stub / live / proxy / hybrid) |
| Tests | Vitest (84), Playwright (3 E2E) |
| Déploiement | Vercel + Supabase cloud (tier gratuit) |

### 4.2 Modèle de données

L'entité centrale est **`projects`** (code auto `PRJ-XXXXXXXX`, propriétaire, CPI assigné, statut workflow, métadonnées JSON).

**Tables principales — Phase 1 :**

| Table | Rôle |
|-------|------|
| `profiles`, `roles`, `user_roles` | Utilisateurs et permissions |
| `projects` | Dossiers PI |
| `documents`, `document_versions` | Fichiers et historique |
| `messages`, `project_tasks`, `project_comments` | Collaboration |
| `ai_searches`, `ai_results` | Analyses IA |
| `ai_chat_sessions`, `ai_chat_messages` | Assistant conversationnel |
| `notifications`, `audit_logs` | Alertes et traçabilité |

**Extensions — Phases 2 et 3 :**

| Migration | Contenu | Rôle |
|-----------|---------|------|
| `00025` | `ip_watchlist`, `ip_watch_alerts`, `patent_claims_drafts` | Surveillance + revendications |
| `00026` | `ip_tech_watch` | Veille technologique |
| `00027` | `patent_drafts` | Rédaction brevet |
| `00028` | colonnes portefeuille watchlist | Logo, date enregistrement |
| `00029` | type `fto` | Analyse liberté d'exploitation |
| `00030` | `patent_draft_versions` | Historique rédaction + opposition |
| `00031` | type `design`, enum `tech_watch_kind` | Dessins & modèles |
| `00032` | suppression `project_commercialization` | Retrait valorisation |

Les cycles marque et brevet sont stockés dans `projects.metadata`, parsés par `marque-lifecycle.ts` et `brevet-lifecycle.ts`.

### 4.3 Sécurité — Row Level Security

Des fonctions SQL centralisent les permissions : `can_view_project()`, `can_edit_project()`, `is_project_cpi()`, `has_role()`. Chaque table sensible possède des policies SELECT/INSERT/UPDATE. Après chaque migration, j'ai testé avec deux comptes : un porteur ne doit jamais voir le dossier d'un autre ; le CPI assigné doit y accéder.

### 4.4 Workflow des statuts projet

```
draft → submitted → in_review → awaiting_documents
  → expert_review → cpi_review → approved | rejected → closed
```

Les transitions sont contrôlées par `resolveStatusChangeMode()` et `isCpiStatusTransitionAllowed()` — un porteur ne peut pas s'auto-valider un dossier.

### 4.5 Organisation des routes

| Espace | URL | Rôle |
|--------|-----|------|
| Connexion | `/auth/login` | Public |
| Porteur | `/dashboard`, `/dashboard/projects/[id]` | `project_holder` |
| Surveillance | `/dashboard/surveillance` | Porteur |
| CPI | `/cpi`, `/cpi/cases/[id]` | `cpi_advisor` |
| Expert | `/expert` | `expert` |
| Admin | `/admin` | `admin` |
| Sécurité | `/dashboard/security` | Authentifié |

La landing marketing a été supprimée : `/` redirige vers la connexion.

### 4.6 Diagrammes UML

Documentés dans `docs/DIAGRAMMES_UML.md` (export via [mermaid.live](https://mermaid.live)) :

1. Cas d'utilisation (Phase 1 + 2 + 3)
2. Diagramme de classes
3. Séquence antériorité IA
4. Séquence surveillance OMPIC
5. Diagramme de Gantt du stage
6. Diagramme d'activité — parcours dossier complet

---

## Chapitre 5 — Réalisation

### 5.1 Phase 1 — Socle collaboratif

#### Authentification et rôles

- Inscription / connexion Supabase ;
- Choix du rôle à l'onboarding ;
- Middleware : redirection selon rôle, email confirmé obligatoire ;
- Guards serveur `requireUser()` sur routes sensibles.

#### Projets et documents

- Création projet (titre, résumé invention, catégorie brevet/marque/dessin…) ;
- Upload vers Supabase Storage avec versions historisées ;
- OCR local Tesseract.js pour PDF scannés (gratuit, dans le navigateur).

#### Checklist et antériorité

- Templates par catégorie (`src/lib/checklists/templates.ts`) ;
- Item « Recherche d'antériorité documentée » lié aux analyses IA ;
- URLs role-aware : le CPI arrive sur `/cpi/cases/[id]?tab=search`.

#### Collaboration

- Messagerie par projet, tâches, commentaires juridiques (`is_legal`) ;
- Notifications cloche + badge (correction bug sync messages/notifications).

#### Espace CPI

- Kanban par statut avec règles de transition ;
- Export rapports CSV/HTML ;
- Assignation CPI (migration `00023`).

#### Module IA

**Flux nouveauté :**

1. Clic « Lancer l'analyse » → INSERT `ai_searches` (`pending`) ;
2. Worker `npm run ai:worker:loop` → `POST /api/ai/worker` ;
3. Requête EPO OPS (CQL) + synthèse Hugging Face ;
4. INSERT `ai_results`, statut `completed`, notifications.

**Correction notable :** erreurs EPO 404 dues à une syntaxe CQL incorrecte — corrigée (`txt all` + requêtes de secours).

**Chat assistant :** contexte dossier injecté dans le prompt (documents, checklist, tâches, analyses).

### 5.2 Phase 2 — Attentes encadrante

#### Surveillance OMPIC

- Tables `ip_watchlist` et `ip_watch_alerts` ;
- UI `/dashboard/surveillance` et `/cpi/surveillance` ;
- Provider OMPIC : modes **stub** (démo), **live** (search.ompic.ma), **proxy** (n8n), **hybrid** ;
- Scan via worker + cron hebdomadaire GitHub Actions ;
- Statuts alerte : `new`, `acknowledged`, `opposition_filed`, `dismissed`.

#### Veille technologique

- Table `ip_tech_watch` — mots-clés, classes IPC, territoire ;
- Runner `tech-watch-runner.ts` — scan EPO périodique ;
- Cron partagé avec la surveillance.

#### Rédaction brevet et revendications

- **`patent_drafts`** : sections OMPIC (titre, domaine technique, état de l'art, description, abrégé…) ;
- **`patent_claims_drafts`** : revendication indépendante + dépendantes (JSON) ;
- Générateur brouillon IA à partir du résumé invention (aide, pas substitut CPI).

#### Cycles marque et brevet

**Marque :** `depose → publie (2 mois) → opposition_ouverte → enregistre → surveillance_active`

**Brevet :** `depose → examen → en_attente_publication (18 mois) → publie → accorde → surveillance_active`

Widget échéances sur le tableau de bord si date ≤ 30 jours.

#### Sécurité renforcée

- Email confirmé bloquant l'accès ;
- 2FA TOTP activable sur `/dashboard/security` ;
- RLS sur toutes les tables Phase 2 ;
- Audit logs admin.

#### Refonte interface

- Suppression landing → connexion directe ;
- En-tête projet : fil d'Ariane, référence, bandeau KPI ;
- Onglets style enterprise, navigation par sections ;
- Même logique vue CPI `/cpi/cases/[id]`.

### 5.3 Phase 3 — Finitions

#### Crédibilité métier

- Synchronisation auto checklist ↔ analyses IA ;
- Analyse **FTO** (Freedom to Operate) — migration `00029` ;
- **Historique rédaction** (`patent_draft_versions`) ;
- **Fiche opposition** sur alertes marque ;
- Portefeuille watchlist enrichi (logo, date enregistrement).

#### Dessins & modèles

- Type d'actif `design` en watchlist ;
- Recherche EPO designs (`epo-design-search.ts`) ;
- Veille différenciée `tech_watch_kind` (`patent` | `design`) ;
- Checklist et panels UI dédiés.

#### Performance et UX

- Middleware allégé (suppression requêtes DB systématiques) ;
- `React.cache()` sur contexte utilisateur ;
- Pages `loading.tsx` + Suspense ;
- Requêtes parallèles dashboard ; notifications marquées lues côté client.

#### Robustesse

- Endpoint `/api/health` (DB, Storage, variables) ;
- Cache OMPIC + rate limiting ;
- Fallback synthèse LLM si quota dépassé ;
- Tests E2E Playwright (3 scénarios smoke).

### 5.4 Bugs marquants corrigés

| Problème | Correction |
|----------|------------|
| CPI redirigé vers URL porteur | `project-routes.ts`, URLs role-aware |
| EPO OPS 404 | Syntaxe CQL corrigée |
| Analyses bloquées `pending` | Doc worker + `ai:worker:loop` |
| Badge notifications incohérent | Sync messages ↔ notifications |
| `useActionState` React 19 | Migration `useFormState` (React 18) |
| Navigation lente | Middleware allégé, cache, loading states |

---

## Chapitre 6 — Tests et validation

### 6.1 Tests automatisés

**84 tests Vitest** répartis en **25 fichiers**, couvrant :

- transitions de statut CPI ;
- lifecycles marque et brevet ;
- échéances PI ;
- parsing checklist et antériorité ;
- surveillance OMPIC et dessins & modèles ;
- cache OMPIC, fallback LLM ;
- navigation dashboard.

**3 tests E2E Playwright** (`e2e/smoke.spec.ts`) : page login, accès dashboard authentifié, navigation projet.

```bash
npm test              # 84 tests Vitest
npm run test:e2e      # 3 tests Playwright
npm run typecheck     # TypeScript strict
```

### 6.2 Tests manuels — grille de validation

| # | Scénario | Résultat attendu |
|---|----------|------------------|
| 1 | Porteur crée projet brevet + upload PDF | Document visible, checklist init |
| 2 | Analyse nouveauté + worker actif | `pending` → `completed` |
| 3 | Soumission dossier | CPI notifié, statut `submitted` |
| 4 | CPI change statut | Porteur notifié |
| 5 | CPI commentaire juridique | Visible filtré juridique |
| 6 | Watchlist + scan OMPIC | Alerte similarité créée |
| 7 | Cycle marque → publié | Échéance opposition calculée |
| 8 | Actif type `design` | Recherche EPO designs |
| 9 | Fiche opposition sur alerte | Métadonnées enregistrées |
| 10 | Activation 2FA | QR TOTP fonctionnel |
| 11 | Mobile 375px | Onglets utilisables |
| 12 | `/api/health` | Statut OK |

Comptes démo : porteur `aminatkimbiri@gmail.com`, CPI `kimbiriaminata16@gmail.com` (voir `DEMO_ENCADRANTE.md`).

### 6.3 Limites assumées

| Limite | Commentaire |
|--------|-------------|
| OMPIC live | Dépend d'un proxy ; mode stub disponible pour démo hors réseau |
| IA | Aide à la décision, pas avis juridique |
| OCR | Performance variable sur gros PDF |
| Dépôt officiel | Hors scope — directompic.ma |
| Export zip complet | Partiellement préparé, livraison complète prévue |
| Valorisation commerciale | Module retiré (hors périmètre final) |

---

## Chapitre 7 — Difficultés rencontrées

### 7.1 Apprendre le métier PI en codant

Le vocabulaire PI est dense. Sans les retours encadrante, j'aurais unifié marque et brevet en un seul workflow. **Solution :** glossaire personnel, scénarios narratifs distincts, validation régulière.

### 7.2 Row Level Security Supabase

Les policies SQL renvoient parfois des résultats vides sans message d'erreur. **Solution :** fonctions helpers SQL, tests systématiques deux comptes.

### 7.3 Absence d'API OMPIC publique documentée

L'encadrante attend une surveillance « comme sur OMPIC », but pas d'API officielle. **Solution :** pattern provider stub/live/proxy, cache, rate limiting, documentation contrat HTTP dans `OMPIC_SURVEILLANCE.md`.

### 7.4 Asynchronisme IA

Analyses bloquées en `pending` si le worker n'est pas lancé. **Solution :** script `ai:worker:loop`, documentation README et guide démo.

### 7.5 Complexité interface

Utilisateurs perdus (trop d'onglets, landing marketing). **Solution :** menu réduit, guide par rôle, refonte fiche projet, suppression landing.

### 7.6 Performance navigation

Lenteur au clic entre pages (middleware lourd). **Solution :** allègement middleware, `React.cache()`, Suspense + `loading.tsx`.

---

## Chapitre 8 — Bilan et compétences acquises

### 8.1 Avant / après

| Dimension | Avant | Après |
|-----------|-------|-------|
| Next.js | Notions générales | App Router, Server Actions, middleware |
| Supabase | Découverte | Migrations, RLS, Storage, Auth |
| PI / OMPIC | Quasi nul | Parcours porteur-CPI, cycles marque/brevet/dessin |
| IA | Aucune | EPO OPS, HF, workers, chat contextuel |
| Tests | Peu pratiqués | 84 Vitest + 3 E2E Playwright |
| Documentation | Minimale | UML, Gantt, guide démo, rapport |

### 8.2 Compétences techniques

- Conception schéma relationnel et migrations versionnées (32 migrations) ;
- Policies RLS multi-rôles ;
- Intégration APIs REST (EPO, Hugging Face, OMPIC) avec mode dégradé ;
- Architecture asynchrone (workers, cron GitHub Actions) ;
- Composants React structurés (Radix/shadcn) ;
- Tests unitaires et E2E.

### 8.3 Compétences transverses

- Traduire retours métier en backlog technique ;
- Présenter une démo honnête (stub vs live) ;
- Rédiger documentation reprise projet ;
- Lire documentation technique anglaise (EPO, Supabase, Next.js).

### 8.4 Apports personnels marquants

1. **Lier checklist et analyse IA** — une recherche n'est pas une feature isolée, but une preuve d'étape dans le dossier ;
2. **Surveillance marque** — la PI continue après le dépôt, parfois pendant des années ;
3. **Double session porteur/CPI** — indispensable pour valider permissions et UX.

---

## Conclusion et perspectives

PatentIQ est passé d'un **dossier collaboratif** (Phase 1) à une plateforme couvrant **surveillance OMPIC, veille technologique, rédaction et revendications, cycles marque/brevet/dessin, échéances PI, fiche opposition et sécurité renforcée** (Phase 2), puis **finitions UX et robustesse** (Phase 3). L'interface professionnelle permet une démonstration crédible devant une encadrante experte PI.

Le choix **Next.js + Supabase** reste pertinent : déploiement Vercel + Supabase cloud sans coût initial, workers IA locaux ou via GitHub Actions, APIs EPO/Hugging Face gratuites pour la démo.

**Perspectives court terme :**

1. Consolidation OMPIC live en production (proxy + conformité juridique) ;
2. Export zip dossier complet pour le CPI ;
3. Page « Préparer dépôt directompic » ;
4. 2FA obligatoire CPI et chiffrement champs sensibles ;
5. CI avec tests E2E sur chaque PR.

**Perspectives moyen terme :**

- RAG sur contenu PDF des documents ;
- Tableau de bord portefeuille PI consolidé ;
- Environnement staging + CI complète.

Personnellement, ce stage confirme mon intérêt pour les projets **full-stack à forte contrainte métier**. Derrière chaque formulaire — revendication, alerte similarité, cycle marque — se cache une règle PI à comprendre avant de coder. Je repars avec une expérience concrète, une introduction à l'écosystème OMPIC, et la satisfaction d'avoir aligné une partie du code sur des attentes réelles exprimées en réunion de suivi.

---

## Bibliographie

### Propriété intellectuelle

- OMPIC — https://www.ompic.ma
- directompic — https://directompic.ma
- INPI (référence France) — https://www.inpi.fr
- Office européen des brevets — https://www.epo.org
- Documentation EPO OPS — https://developers.epo.org

### Technique

- Next.js 14 — https://nextjs.org/docs
- Supabase — https://supabase.com/docs
- Hugging Face — https://huggingface.co/docs
- Vitest — https://vitest.dev
- Playwright — https://playwright.dev
- Mermaid — https://mermaid.live

### Documentation interne PatentIQ

- `README.md`
- `docs/DIAGRAMMES_UML.md`
- `docs/DEMO_ENCADRANTE.md`
- `docs/OMPIC_SURVEILLANCE.md`
- `docs/ROADMAP_ATTENTES_ENCADRANTE.md`
- `docs/WORKER_AND_DEPLOY.md`
- `docs/VERDICT_J_VEILLE_FTO.md`

---

## Annexes

### Annexe A — Glossaire

| Terme | Définition |
|-------|------------|
| **PI** | Propriété intellectuelle |
| **OMPIC** | Office marocain de la propriété industrielle et commerciale |
| **CPI** | Conseiller en propriété industrielle |
| **Antériorité** | État de l'art existant avant l'invention |
| **FTO** | Freedom to Operate — liberté d'exploitation |
| **Revendications** | Périmètre juridique exact protégé (claims) |
| **Opposition** | Contestation de l'enregistrement d'une marque |
| **Veille techno** | Surveillance continue de l'état de l'art |
| **Surveillance** | Suivi post-enregistrement des titres similaires |
| **RLS** | Row Level Security — sécurité au niveau des lignes PostgreSQL |
| **Provider OMPIC** | Couche d'abstraction stub/live/proxy |

### Annexe B — Captures d'écran à insérer

1. Page de connexion
2. Tableau de bord porteur + widget échéances
3. Fiche projet — en-tête, KPI, onglets
4. Parcours PI — rédaction brevet
5. Parcours PI — revendications
6. Analyse IA — historique
7. Surveillance — watchlist + alerte
8. Cycle marque — échéance opposition
9. Cycle brevet — attente publication
10. Dessin & modèle — watchlist type `design`
11. Fiche opposition sur alerte
12. Vue CPI + Kanban
13. Page sécurité — 2FA
14. Diagramme cas d'utilisation (Mermaid)
15. Diagramme Gantt du stage

### Annexe C — Commandes utiles

```bash
npm install
npm run dev                  # terminal 1
npm run ai:worker:loop       # terminal 2 — analyses IA
npm run db:push              # migrations Supabase
npm test                     # 84 tests Vitest
npm run test:e2e             # 3 tests Playwright
npm run typecheck
```

Variables `.env.local` essentielles :

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `HUGGINGFACE_API_KEY`
- `EPO_OPS_CONSUMER_KEY`, `EPO_OPS_CONSUMER_SECRET`
- `AI_WORKER_SECRET`
- `OMPIC_SEARCH_MODE=stub|live|proxy|hybrid`

### Annexe D — Journal de bord (exemple à personnaliser)

| Sem. | Activités | Résultat |
|------|-----------|----------|
| 1–2 | Installation, auth, rôles | Environnement OK |
| 3–5 | Projets, documents, checklist | CRUD porteur |
| 6–8 | Messagerie, CPI, Kanban | Collaboration |
| 9–11 | EPO OPS, worker IA, chat | Analyses fonctionnelles |
| 12–14 | Réunion encadrante, roadmap | Phase 2 planifiée |
| 15–17 | Surveillance, cycles PI | Watchlist + échéances |
| 18–20 | Rédaction, veille, 2FA | Parcours PI brevet |
| 21 | Refonte UI | Interface démo |
| 22–23 | Opposition, dessins, perf, E2E | Phase 3 livrée |
| 24 | Rapport, UML, répétition démo | Livrables stage |

### Annexe E — Mapping attentes encadrante ↔ PatentIQ

| Attente | Réponse PatentIQ |
|---------|------------------|
| Systèmes différents marque / brevet / dessin | Cycles + checklists + types watchlist |
| Surveillance catalogue OMPIC | Watchlist + alertes (stub/live/proxy) |
| Veille technologique | `ip_tech_watch` + cron |
| Rédaction / revendications confidentielles | Parcours PI + historique versions |
| Opposition marque | Fiche opposition sur alertes |
| Sécurité avant dépôt | RLS, email confirmé, 2FA |
| Échéances 2 mois / 18 mois | `ip-deadlines` + notifications |
| Pas de dépôt direct | Lien conceptuel directompic |
| Robustesse démo | Health check, 84 tests + E2E |

---

*Fin du rapport — [Prénom NOM] — [Date]*
