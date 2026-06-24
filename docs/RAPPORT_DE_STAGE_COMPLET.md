# Rapport de stage

### Conception et développement de PatentIQ, une plateforme web d'assistance à la propriété intellectuelle

**Structure d'accueil :** I2PA — International Intellectual Property Assistance, Mohammedia (Maroc)

---

## Page de garde

| | |
|---|---|
| **Auteur** | [Prénom NOM] |
| **Numéro étudiant / promotion** | [À COMPLÉTER] |
| **Filière** | [À COMPLÉTER] |
| **Établissement** | [À COMPLÉTER] |
| **Intitulé du stage** | Conception et développement de PatentIQ |
| **Période** | du [JJ/MM/AAAA] au [JJ/MM/AAAA] — [X] semaines |
| **Entreprise** | I2PA — Lot Massira, Résidence Costa del Sol, Mohammedia |
| **Site web** | https://i2pa.com/ |
| **Encadrante entreprise** | [Prénom NOM, fonction] |
| **Tuteur pédagogique** | [Prénom NOM] |
| **Année universitaire** | [2025–2026] |

---

## Remerciements

Il y a des stages que l'on traverse en exécutant une liste de tâches, et d'autres qui changent la manière dont on regarde son propre métier. Le mien appartient à la seconde catégorie, et je tiens à remercier celles et ceux qui l'ont rendu possible.

Je remercie d'abord toute l'équipe d'**I2PA** pour son accueil. J'y suis arrivé avec des compétences techniques mais une connaissance très superficielle de la propriété intellectuelle. J'en repars en sachant qu'une marque, un brevet et un dessin industriel ne se gèrent pas de la même manière, et que cette distinction n'est pas un détail théorique : elle structure le quotidien d'un cabinet.

Ma reconnaissance va tout particulièrement à **[encadrante I2PA]**. Elle n'a jamais réduit PatentIQ à un « projet informatique ». À chaque point d'avancement, elle me ramenait au métier : que doit voir un conseiller en premier, pourquoi une revendication ne peut pas se retrouver dans un fil de discussion ouvert, à quel moment une similarité de marque devient une vraie menace juridique. Cet ancrage m'a évité de livrer une coquille séduisante mais creuse.

Je remercie également **[tuteur académique]** pour son suivi, ses relectures et son exigence sur la qualité de la documentation.

Enfin, merci à toutes les personnes qui ont accepté de tester l'application en conditions réelles, souvent avec deux navigateurs ouverts côte à côte — l'un en porteur, l'autre en conseiller. C'est dans ces sessions un peu artisanales que la majorité des défauts de permissions et de navigation ont été repérés, bien avant qu'ils n'atteignent une démonstration officielle.

---

## Résumé

La propriété intellectuelle est un domaine où le temps et la confidentialité comptent autant que l'idée elle-même. Protéger une innovation suppose de la décrire précisément, de vérifier qu'elle est nouvelle, de respecter des délais réglementaires stricts, puis de surveiller le titre une fois obtenu. Au Maroc, ces démarches s'appuient sur l'**OMPIC** et le portail **directompic.ma**, et reposent sur l'accompagnement d'un **conseiller en propriété industrielle (CPI)**. Or, en pratique, le suivi d'un dossier se disperse souvent entre courriels, fichiers PDF mal rangés et recherches d'antériorité jamais reliées au dossier client.

C'est à ce problème concret que répond **PatentIQ**, la plateforme que j'ai contribué à développer durant mon stage chez **I2PA**. Il ne s'agit pas d'un outil de dépôt — ce rôle reste celui de l'OMPIC — mais d'un espace de travail qui **prépare, structure et suit** un dossier de propriété intellectuelle, avant comme après les démarches officielles.

La plateforme s'organise autour de **quatre rôles** (porteur de projet, conseiller PI, expert métier, administrateur) et de **sept catégories** de dossiers couvrant l'ensemble des titres pris en charge par le cabinet. Elle réunit la gestion documentaire, des checklists métier adaptées à chaque catégorie, un **score de complétude** du dossier, des analyses assistées par intelligence artificielle (recherche de nouveauté, liberté d'exploitation, classification), un **pré-examen automatique** des brouillons de brevet, la surveillance des marques sur la base publique de l'OMPIC, la veille technologique sur les brevets, et des parcours de cycle de vie distincts pour la marque, le brevet et le dessin.

Sur le plan technique, PatentIQ s'appuie sur **Next.js 14**, **TypeScript**, **Supabase** (PostgreSQL, authentification, stockage de fichiers et sécurité au niveau ligne) ainsi que sur **Tailwind CSS** et **shadcn/ui**. À la clôture du stage, le projet comptait **32 migrations de base de données**, **104 tests unitaires** automatisés et des tests de bout en bout pour les parcours critiques. Les limites du projet sont documentées sans complaisance : absence d'API publique pour les dessins OMPIC, nécessité d'un service de traitement asynchrone pour les analyses IA, et caractère seulement indicatif des synthèses automatiques.

**Mots-clés :** propriété intellectuelle, OMPIC, brevet, marque, dessin et modèle, Next.js, Supabase, intelligence artificielle, antériorité, surveillance, veille technologique, liberté d'exploitation.

---

## Abstract

During my internship at **I2PA** (International Intellectual Property Assistance), based in Mohammedia, Morocco, I took part in the design and development of **PatentIQ**, a full-stack web platform dedicated to intellectual property case management. The application brings together project holders, IP advisors, technical experts and administrators in a single, traceable workspace: shared documents, category-specific checklists, AI-assisted prior-art and freedom-to-operate analyses, trademark monitoring through the public OMPIC search portal, and technology watch over patent databases.

PatentIQ deliberately does not replace official filing on directompic.ma. Its purpose is to structure collaboration upstream and downstream of official procedures. The technical foundation combines Next.js 14, TypeScript and Supabase with two free external APIs: the European Patent Office's Open Patent Services and Hugging Face for text synthesis. By the end of the internship, the repository contained 32 SQL migrations and 104 unit tests, alongside end-to-end tests for the most sensitive flows. The project's constraints are stated honestly, including the lack of a public REST API for OMPIC designs and the asynchronous worker required to process AI analyses. Above all, this internship taught me that, in a domain like intellectual property, the business rules must shape the software — not the other way around.

**Keywords:** intellectual property, OMPIC, patent, trademark, design, Next.js, Supabase, artificial intelligence, prior art, monitoring, technology watch.

---

## Liste des acronymes

| Acronyme | Signification |
|----------|---------------|
| API | Interface de programmation applicative |
| CPI | Conseiller en propriété industrielle |
| CQL | Contextual Query Language (langage de requête EPO) |
| EPO | Office européen des brevets |
| FTO | Freedom to Operate — liberté d'exploitation |
| IA | Intelligence artificielle |
| I2PA | International Intellectual Property Assistance |
| IPC / CPC | Classifications internationales des brevets |
| LLM | Large Language Model (grand modèle de langage) |
| MFA / 2FA | Authentification à plusieurs facteurs |
| OCR | Reconnaissance optique de caractères |
| OMPIC | Office marocain de la propriété industrielle et commerciale |
| OPS | Open Patent Services (API de l'EPO) |
| PI | Propriété intellectuelle |
| RAG | Génération augmentée par récupération de contexte |
| RLS | Row Level Security (sécurité au niveau ligne, PostgreSQL) |
| SQL | Langage de requête structuré |
| UI / UX | Interface / expérience utilisateur |

---

# Introduction générale

## Un point de départ honnête

Avant ce stage, j'avais déjà construit plusieurs applications web : des interfaces de gestion, des formulaires, de l'authentification. J'étais à l'aise avec le « comment » technique. Ce qui m'a manqué au début, et que ce stage m'a forcé à acquérir, c'est le « pourquoi » métier.

Très vite, une réalité s'est imposée : dans la propriété intellectuelle, on ne peut pas coder d'abord et comprendre ensuite. Une revendication de brevet n'est pas un commentaire ordinaire ; elle est confidentielle et engageante. Une alerte de similarité sur une marque n'est pas une notification anodine ; elle ouvre une fenêtre d'opposition limitée dans le temps. Un brevet, lui, reste secret puis se publie autour de dix-huit mois après le dépôt. Si l'on ignore ces règles, on produit un logiciel qui « fonctionne » mais qui ne sert à rien pour un professionnel.

## Problématique

La question centrale de mon stage peut se formuler ainsi :

> Comment doter un cabinet de conseil comme I2PA d'un outil numérique capable de **centraliser et de fiabiliser** le suivi d'un dossier de propriété intellectuelle, sans se substituer aux portails officiels de l'OMPIC, tout en intégrant l'intelligence artificielle de manière **transparente, traçable et honnête** ?

## Objectifs

Mes objectifs se sont articulés en quatre axes :

1. **Comprendre** le parcours réel d'un dossier, du porteur au conseiller, et les spécificités marocaines ;
2. **Concevoir et développer** PatentIQ par itérations courtes et vérifiables ;
3. **Aligner** les fonctionnalités sur les retours concrets de l'encadrante plutôt que sur mes propres suppositions ;
4. **Tester, documenter et préparer** une démonstration crédible pour la soutenance.

## Méthode de travail

J'ai adopté une approche volontairement incrémentale. Plutôt que de tout planifier au début, je livrais une brique à la fois — une migration de base de données, une action serveur, un composant d'interface — puis je la testais avant d'avancer. Chaque évolution était validée en « double session » : un compte porteur dans un navigateur, un compte conseiller dans un autre. Cette discipline, un peu manuelle, m'a évité de croire qu'une fonctionnalité était terminée alors qu'elle ne l'était que pour un seul rôle.

## Organisation du document

Ce rapport suit six chapitres : la présentation d'I2PA, l'analyse du contexte et de l'existant, l'étude des besoins et la conception, la réalisation technique, le volet intelligence artificielle et données, puis les tests et perspectives. Une conclusion et des annexes techniques complètent l'ensemble.

---

# Chapitre 1 — Présentation de l'entreprise d'accueil

## 1.1 Identité

**I2PA** — *International Intellectual Property Assistance* — est une structure marocaine spécialisée dans l'assistance et le conseil en propriété intellectuelle, installée à **Mohammedia**. Sa communication publique s'articule autour du slogan *« Protéger, valoriser, innover »*, qui résume bien son positionnement : il ne s'agit pas seulement de déposer des titres, mais d'aider les clients à exploiter intelligemment leur patrimoine immatériel.

| Information publique | Détail |
|----------------------|--------|
| Raison sociale | I2PA — International Intellectual Property Assistance |
| Localisation | Lot Massira, Résidence Costa del Sol, Mohammedia |
| Site web | https://i2pa.com/ |
| Contact | Contact@i2pa.com — (+212) 615 539 752 |
| Horaires affichés | Du lundi au vendredi, 09h00 – 18h00 |

## 1.2 Une distinction fondamentale : conseiller n'est pas déposer

Un point a structuré toute ma compréhension du contexte : **I2PA n'est pas un office de dépôt**. Le dépôt officiel d'une marque ou d'un brevet relève de l'**OMPIC** et de ses portails, notamment directompic.ma. I2PA se situe en amont et en aval de cet acte : aider à constituer un dossier solide, vérifier l'antériorité, choisir la bonne stratégie de protection, puis surveiller et défendre le titre une fois obtenu.

Cette distinction a une conséquence directe sur PatentIQ : la plateforme ne devait jamais prétendre « déposer à la place de l'OMPIC ». Elle prépare le travail et le rend lisible, mais l'acte officiel reste extérieur. Cette honnêteté de périmètre est devenue un principe de conception.

## 1.3 Domaines d'intervention observés

Au fil de mes échanges, j'ai identifié plusieurs grands domaines d'activité du cabinet :

- l'accompagnement au dépôt de **brevets d'invention** et de **modèles d'utilité** ;
- la protection des **marques** (signes distinctifs) ;
- la protection des **dessins et modèles** (apparence des produits) ;
- la **veille** et la **surveillance** des titres existants ;
- les aspects **contractuels** (licences, cessions) et la valorisation.

PatentIQ a été pensé comme un outil interne au service de ces missions, et non comme un produit grand public.

## 1.4 Cadre humain du stage

| Acteur | Rôle dans le projet |
|--------|---------------------|
| Encadrante I2PA | Cadrage métier, priorisation, validation fonctionnelle des écrans |
| Tuteur académique | Suivi pédagogique, accompagnement sur le rapport |
| Stagiaire (auteur) | Analyse, développement, tests et documentation |

---

# Chapitre 2 — Contexte du projet et analyse de l'existant

## 2.1 Le problème concret

Sans outil dédié, le suivi d'un dossier PI se dégrade vite, et de manière prévisible :

- les pièces justificatives se perdent dans des fils de courriels ;
- une recherche d'antériorité réalisée une fois n'est jamais rattachée au dossier ;
- les délais propres à chaque type de titre se confondent — alors qu'une marque et un brevet n'ont rien de comparable de ce point de vue ;
- le conseiller n'a pas de vue d'ensemble de son portefeuille de clients.

Le coût de cette désorganisation n'est pas seulement un inconfort : dans un domaine où une fenêtre d'opposition se mesure en semaines, perdre une information peut avoir des conséquences juridiques.

## 2.2 L'existant et ses limites

| Outil courant | Pourquoi il ne suffit pas |
|---------------|---------------------------|
| Courriel + cloud généraliste | Aucun flux de travail PI, aucune gestion fine des rôles, traçabilité faible |
| Bases publiques (Espacenet, EPO) | Consultation externe, jamais intégrée au dossier client |
| Logiciels PI « entreprise » | Coût et complexité disproportionnés pour un cabinet de taille humaine |
| Portails OMPIC | Dépôt et recherche officielle, mais aucune collaboration porteur–conseiller |

PatentIQ cherche un positionnement intermédiaire : une application web légère, hébergeable à faible coût (Vercel et l'offre gratuite de Supabase), centrée sur le parcours marocain porteur–CPI.

## 2.3 La remarque qui a réorienté le projet

Lors d'un point de suivi, l'encadrante a formulé une phrase que j'ai d'abord sous-estimée : *« Les systèmes sont différents par rapport aux produits. »*

Traduit dans le concret : on ne gère pas une marque comme un brevet. Une marque se publie, ouvre une courte fenêtre d'opposition d'environ deux mois, puis s'enregistre et se surveille. Un brevet, lui, reste confidentiel, attend sa publication autour de dix-huit mois, et s'inscrit dans une logique d'examen technique.

J'avais initialement esquissé un parcours unique pour tous les titres. Cette remarque m'a fait tout reprendre : des **cycles de vie distincts**, des **checklists séparées par catégorie**, et même des **libellés adaptés** dans l'interface — par exemple « description de la marque » au lieu de « résumé de l'invention » pour un dossier de marque, puisqu'une marque n'est pas une invention technique. Ce détail, apparemment cosmétique, traduit en réalité une exigence métier.

---

# Chapitre 3 — Analyse des besoins et conception

## 3.1 Les acteurs et leurs rôles

PatentIQ distingue quatre rôles applicatifs, définis dans la base de données (table `roles`) et appliqués par des gardes de sécurité côté serveur :

| Rôle (code technique) | Espace dédié | Responsabilités |
|-----------------------|--------------|-----------------|
| `project_holder` (porteur) | `/dashboard` | Créer des dossiers, déposer des documents, lancer des analyses, suivre l'avancement |
| `cpi_advisor` (conseiller) | `/cpi` | Traiter les dossiers assignés, faire évoluer les statuts, piloter le portefeuille et la surveillance |
| `expert` (expert métier) | `/expert` | Rendre un avis technique et des recommandations structurées |
| `admin` (administrateur) | `/admin` | Gérer les utilisateurs, les paramètres du flux de travail et l'audit |

Chaque rôle dispose d'une navigation propre et d'un tableau de bord adapté. Un utilisateur ne voit que ce qui le concerne, ce qui n'est pas seulement une question d'ergonomie mais de confidentialité.

## 3.2 Les catégories de dossiers

Sept catégories sont prévues, chacune correspondant à un type de besoin réel du cabinet :

1. Brevet d'invention ;
2. Modèle d'utilité ;
3. Marque ;
4. Dessin et modèle ;
5. Secret d'affaires ;
6. Veille et liberté d'exploitation ;
7. Autre.

À chaque catégorie correspond une **checklist métier** spécifique. Par exemple, la checklist « brevet » insiste sur la description technique, les figures, l'ébauche de revendications et la recherche d'antériorité ; la checklist « marque » porte sur le signe, les classes de Nice, l'antériorité et la surveillance post-dépôt. Cette granularité évite de présenter à un porteur de marque des étapes qui n'ont de sens que pour un brevet.

## 3.3 Besoins fonctionnels

| Besoin métier | Réponse apportée par PatentIQ |
|---------------|-------------------------------|
| Espace dossier partagé | Projet structuré en onglets : Dossier, Échanges, Analyses IA |
| Traçabilité des actions | Historique des statuts, journaux d'audit, notifications |
| Antériorité et FTO assistées | Analyses IA combinant l'EPO et l'OMPIC, avec synthèse |
| Surveillance des marques | Recherche en direct sur le portail public OMPIC + liste de surveillance |
| Veille technologique | Suivi par mots-clés et classes IPC sur les brevets |
| Rédaction de brevet | Sections structurées + aide à la rédaction par IA + export |
| Confidentialité des revendications | Espace dédié, séparé des échanges libres |
| Cycles de vie distincts | Parcours marque, brevet et dessin séparés |
| Rappels d'échéances | Alertes sur l'opposition (marque) et la publication (brevet) |
| Sécurité d'accès | Email confirmé, double authentification, isolation par rôle |
| Pilotage de la complétude | Score pondéré (résumé, documents, checklist) avec prochaine action suggérée |
| Pré-examen du brouillon brevet | Contrôle automatique des anomalies fréquentes avant revue CPI |

## 3.4 Besoins non fonctionnels

Au-delà des fonctionnalités, plusieurs exigences transversales ont guidé les choix :

- **Performance** : tirer parti du rendu côté serveur de Next.js et de chargements progressifs ;
- **Sécurité** : isoler chaque dossier par la sécurité au niveau ligne de PostgreSQL, et séparer physiquement les contenus sensibles des échanges ouverts ;
- **Honnêteté produit** : ne jamais simuler une donnée comme si elle était réelle ; distinguer clairement les modes de fonctionnement de la recherche OMPIC ;
- **Maintenabilité** : typage strict, tests automatisés, documentation versionnée dans le dossier `docs/`.

## 3.5 Architecture générale

L'architecture retenue est volontairement compacte, sans serveur applicatif séparé :

```
        Navigateur (porteur / CPI / expert / admin)
                        │  HTTPS
                        ▼
        ┌───────────────────────────────────┐
        │        Next.js 14 (App Router)     │
        │  • Composants & actions serveur    │
        │  • Routes API (IA, surveillance)   │
        │  • Middleware auth + email confirmé│
        └───────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │             Supabase               │
        │  • PostgreSQL + RLS (32 migrations)│
        │  • Authentification + MFA          │
        │  • Stockage (documents, avatars)   │
        └───────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │         Services externes          │
        │  • EPO OPS (brevets, filtre pn=MA) │
        │  • Hugging Face (synthèse, chat)   │
        │  • search.ompic.ma (marques)       │
        └───────────────────────────────────┘
```

## 3.6 Modèle de données (extrait)

Le schéma s'organise autour du projet, qui relie la plupart des entités :

- `profiles`, `roles`, `user_roles` — identité et rôles des utilisateurs ;
- `projects` — le dossier, avec son statut, sa catégorie, son porteur, son conseiller assigné et son éventuel expert ;
- `project_members` — droits fins (consultation, commentaire, dépôt) ;
- `documents` et `document_versions` — fichiers et historique des versions ;
- `ai_searches` et `ai_results` — analyses IA et leurs résultats ;
- `project_comments`, `project_tasks` — collaboration ;
- `ip_watchlist`, `ip_watch_alerts`, `ip_tech_watch` — surveillance et veille ;
- `categories`, `tags` — taxonomie.

Chaque table sensible est protégée par des politiques de sécurité au niveau ligne, de sorte que l'accès aux données est contrôlé directement dans la base, et pas seulement dans l'interface.

---

# Chapitre 4 — Réalisation et implémentation

## 4.1 Choix technologiques

| Couche | Technologie | Précision |
|--------|-------------|-----------|
| Cadre applicatif | Next.js 14.2.21 (App Router) | Rendu serveur, actions serveur |
| Langage | TypeScript | Typage strict |
| Interface | Tailwind CSS, shadcn/ui, icônes Lucide | Composants accessibles |
| Base de données | Supabase PostgreSQL | 32 migrations versionnées |
| Authentification | Supabase Auth | Rôles, double authentification |
| Stockage | Supabase Storage | Limite 50 Mo par fichier |
| Validation | Zod, React Hook Form | Schémas partagés client/serveur |
| État UI | Zustand, TanStack Query | Préférences et données |
| Tests | Vitest, Playwright | 104 tests unitaires |
| IA externe | EPO OPS, Hugging Face | APIs gratuites |

Ce choix répond à une contrainte simple : livrer une démonstration crédible **sans budget cloud** au-delà des offres gratuites.

## 4.2 Organisation du code

| Emplacement | Contenu |
|-------------|---------|
| `src/app/` | Routes : espace public, authentification, porteur, conseiller, expert, administrateur |
| `src/lib/actions/` | Actions serveur (projets, documents, surveillance…) |
| `src/lib/ai/` | Pipeline d'analyses, service de traitement, connecteurs EPO et Hugging Face |
| `src/lib/surveillance/` | Fournisseur OMPIC, scan de la liste de surveillance, veille |
| `src/lib/workflow/` | Cycles de vie, gestion des statuts, rappels d'échéances |
| `src/lib/projects/` | Score de complétude du dossier (fonction pure testable) |
| `src/components/` | Composants d'interface métier |
| `supabase/migrations/` | Schéma SQL, sécurité, stockage |
| `docs/` | Documentation, guides de démonstration, diagrammes |

## 4.3 Le flux de travail d'un dossier

Un dossier suit neuf statuts, du brouillon à la clôture :

> Brouillon → Soumis → En revue → Documents attendus → Revue expert → Revue CPI → Approuvé / Rejeté / Clôturé

Le point important n'est pas la liste elle-même, mais le fait que **les transitions dépendent du rôle**. Un porteur ne peut pas faire passer seul son dossier en « Approuvé » ; cette décision revient au conseiller ou à l'administrateur. Cette logique est centralisée afin d'éviter les incohérences, et elle est couverte par des tests automatisés.

## 4.4 Le parcours côté porteur

Du point de vue du porteur, le cœur de l'application est la page de détail d'un projet, organisée en trois onglets :

- **Dossier** : les informations du projet, les documents (avec un bouton de reconnaissance de texte pour les PDF scannés, exécuté localement dans le navigateur), la checklist propre à la catégorie, le **score de complétude** du dossier, et le parcours PI ;
- **Analyses IA** : le lancement d'une analyse (nouveauté, liberté d'exploitation, etc.), l'historique et les rapports ;
- **Échanges** : commentaires, messages du dossier et tâches.

J'ai également ajouté, à la demande implicite des usages observés, la possibilité pour le porteur de **supprimer son propre dossier**, avec confirmation, ainsi qu'une **déconnexion** accessible depuis tous les espaces — des détails simples mais attendus.

## 4.5 Le parcours côté conseiller

Le conseiller dispose de son propre espace : un tableau de bord avec les dossiers en retard et les échéances, la liste de ses dossiers assignés, un tableau Kanban du portefeuille, des rapports exportables, et la même surveillance que le porteur mais à l'échelle de ses clients. C'est lui qui fait évoluer les statuts, dépose des commentaires juridiques et valide les étapes du cycle PI.

## 4.6 Les cycles de vie PI

Trois cycles distincts ont été implémentés, conformément à la remarque structurante de l'encadrante :

- **Marque** : dépôt → publication (fenêtre d'opposition d'environ deux mois) → enregistrement → surveillance ;
- **Brevet** : dépôt → examen → attente de publication (environ dix-huit mois) → publication → délivrance → veille ;
- **Dessin et modèle** : dépôt → examen → publication → enregistrement → surveillance manuelle.

Chacun s'accompagne de rappels d'échéances affichés sur le tableau de bord, afin que ni le porteur ni le conseiller ne laisse passer une date critique.

## 4.7 Phases de développement, vues de l'intérieur

### Phase 1 — Le socle

La première phase a posé les fondations : authentification, choix du rôle à la première connexion, gestion des projets, des documents, des commentaires, des messages et des tâches, ainsi que les premières analyses IA et l'espace conseiller.

*Difficulté vécue :* la sécurité au niveau ligne de Supabase m'a coûté deux jours. Une politique mal écrite bloquait silencieusement la création de projet, sans erreur explicite côté interface. J'ai dû apprendre à raisonner « base de données d'abord », et une migration corrective a finalement réglé le problème.

### Phase 2 — Les attentes du métier

La deuxième phase a aligné l'application sur les retours de l'encadrante : surveillance des marques, veille technologique, rédaction de brevet et éditeur de revendications, cycles de vie marque et brevet, tableau Kanban, rapports et double authentification.

*Constat de terrain :* la surveillance des marques fonctionne réellement en direct sur le portail public de l'OMPIC. En revanche, l'OMPIC ne publie pas d'API ouverte. J'ai donc conçu un fournisseur configurable, avec plusieurs modes (direct, catalogue de secours, proxy, hybride), documenté honnêtement plutôt que masqué derrière une fausse promesse d'« API officielle ».

### Phase 3 — La consolidation

La troisième phase a renforcé la crédibilité : analyse de liberté d'exploitation, fiche d'opposition, historique de rédaction, parcours dessin, score de complétude, pré-examen de brouillon brevet, et de nombreuses finitions d'expérience utilisateur. C'est aussi durant cette phase qu'un incident réel a été corrigé (voir le chapitre suivant).

## 4.8 Score de complétude du dossier

Inspiré des outils de *docketing* utilisés dans les grands cabinets (Anaqua, Alt Legal), mais adapté au périmètre PatentIQ, le **score de complétude** répond à une question simple que se posent porteurs et conseillers : *« Est-ce que mon dossier est prêt à être instruit ? »*

Plutôt qu'un indicateur binaire, la plateforme calcule un **pourcentage pondéré** à partir de quatre critères réels, tirés des données déjà présentes en base — sans simulation :

| Critère | Poids | Source |
|---------|-------|--------|
| Objet du dossier décrit (résumé ou description) | 2 | Champs texte du projet |
| Type de protection défini (catégorie) | 1 | Catégorie sélectionnée |
| Au moins un document téléversé | 2 | Table `documents` |
| Progression de la checklist PI | 5 | Items cochés / total |

Le calcul est implémenté dans une **fonction pure** (`computeProjectCompleteness`), sans accès réseau ni base de données, ce qui permet de la tester unitairement (`tests/project-completeness.test.ts`). L'interface affiche une barre de progression, un niveau lisible (« À compléter », « En cours », « Presque complet », « Prêt à instruire ») et la **première action manquante** à réaliser.

Le panneau est visible en haut de l'onglet **Dossier**, pour le porteur comme pour le conseiller CPI assigné.

**Listing 1 — Calcul pondéré du score de complétude** (`src/lib/projects/completeness.ts`)

```typescript
export function computeProjectCompleteness(input: CompletenessInput): ProjectCompleteness {
  const items: CompletenessItem[] = [
    { id: "objet", label: "Objet du dossier décrit", done: hasSummary, weight: 2 },
    { id: "categorie", label: "Type de protection défini", done: hasCategory, weight: 1 },
    { id: "documents", label: "Au moins un document ajouté", done: hasDocuments, weight: 2 },
    {
      id: "checklist",
      label: `Checklist PI complétée (${input.checklistDone}/${input.checklistTotal})`,
      done: input.checklistTotal > 0 && checklistRatio >= 1,
      weight: 5,
      ratio: checklistRatio,
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const score = items.reduce((sum, item) => {
    const contribution = item.ratio != null ? item.ratio : item.done ? 1 : 0;
    return sum + contribution * item.weight;
  }, 0);

  const percent = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  // … niveau, libellé et prochaine action suggérée
}
```

---

# Chapitre 5 — Intelligence artificielle et traitement des données

## 5.1 Une IA volontairement encadrée

L'IA dans PatentIQ n'est pas un argument marketing : elle répond à des besoins précis et reste cadrée. Sept types d'analyses sont exposés dans l'interface :

| Type | Usage |
|------|-------|
| Nouveauté | Recherche d'antériorité (brevets EPO + OMPIC Maroc, marques OMPIC) |
| Liberté d'exploitation (FTO) | Identifier les brevets actifs susceptibles de bloquer une exploitation |
| Analyse sémantique | Comparaison conceptuelle avec l'état de l'art |
| Similarité | Proximité avec la description du projet |
| Résumé de document | Synthèse d'un fichier déposé ou du dossier |
| Classification PI | Suggestion de classes IPC/CPC |
| Tags suggérés | Étiquettes pour organiser le dossier |

## 5.2 Le pipeline d'analyse

Le déroulement est asynchrone, ce qui est un choix assumé :

1. Le porteur ou le conseiller lance une analyse ;
2. Une entrée est créée en base avec le statut « en attente » ;
3. Un service de traitement (lancé en local ou via une tâche planifiée) prend le relais ;
4. Les résultats et une synthèse textuelle sont enregistrés, puis affichés.

**Précision honnête :** sans ce service de traitement actif, les analyses restent « en attente ». Ce n'est pas un défaut caché ; c'est documenté dans le guide de démonstration, avec la commande à lancer. J'ai préféré une limite claire à une illusion de magie.

## 5.3 Les sources de données, réelles et vérifiables

| Analyse | Source réelle |
|---------|---------------|
| Brevets internationaux | EPO Open Patent Services |
| Publications marocaines | EPO OPS avec le filtre `pn=MA` |
| Marques (antériorité) | Portail public search.ompic.ma |
| Synthèse, chat, brouillon | Hugging Face (modèle configurable) |
| Reconnaissance de texte (PDF) | Tesseract, exécuté localement dans le navigateur |

## 5.4 Un incident réel, et ce qu'il m'a appris

Lors d'une analyse de liberté d'exploitation sur un dossier de test (une veste), la synthèse affichait une note d'erreur indiquant que la recherche EPO était indisponible (code 404). Plutôt que de masquer le message, j'ai investigué.

La cause était subtile : le code filtrait les publications marocaines avec `pa=MA`. Or, dans le langage de requête de l'EPO, le champ `pa` désigne le **déposant**, pas le pays. La requête cherchait donc un déposant nommé « MA » et ne trouvait évidemment rien. Le filtre correct pour les publications marocaines est `pn=MA`, qui porte sur le numéro de publication.

Après correction et ajout de tests dédiés, la même recherche a retourné des brevets marocains valides. J'ai également séparé les appels « EPO international » et « EPO Maroc » pour qu'un échec partiel n'invalide plus l'ensemble de l'analyse. Cet épisode m'a appris à lire une documentation d'API jusqu'au bout, et à ne jamais traiter une erreur comme un simple désagrément à cacher.

## 5.5 Le cas des dessins et modèles : un choix de transparence

J'ai exploré plusieurs pistes pour automatiser la recherche de dessins (bases EPO, comparaison d'images), et j'ai dû me rendre à l'évidence :

- l'OMPIC n'expose pas d'API publique pour les dessins ;
- l'EPO ne propose pas de recherche de dessins enregistrés comparable à celle des marques ;
- un catalogue simulé en permanence serait trompeur lors d'une démonstration.

La décision retenue, validée comme cohérente, a été de **conserver le cycle de gestion du dossier dessin** (du dépôt à la surveillance), avec des liens vers les portails officiels, mais **sans moteur de recherche automatique**. L'antériorité visuelle reste une tâche du conseiller sur les sites OMPIC. C'est un choix moins spectaculaire, mais plus honnête.

## 5.6 Pré-examen automatique du brouillon de brevet

En m'inspirant des logiciels de rédaction assistée (Questel, solutions citées par l'encadrante), j'ai ajouté un **pré-examen** accessible dans l'onglet Parcours PI → Rédaction, après le panneau de brouillon. L'objectif n'est pas de « valider » un brevet, mais de repérer **avant la revue CPI** les anomalies les plus fréquentes dans un dépôt OMPIC.

Le point de conception important : le cœur du module est **déterministe et testable**, pas un appel LLM opaque. La fonction `analyzeDraftHeuristics` parcourt le brouillon (titre, abrégé, description, revendications) et produit une liste d'anomalies classées par gravité :

| Gravité | Exemples de règles vérifiées |
|---------|------------------------------|
| **Bloquant** | Absence de revendication indépendante |
| **À corriger** | Abrégé vide ou > 150 mots, termes vagues dans les revendications (« environ », « optimal »…) |
| **Conseil** | Numérotation des revendications, base d'antériorité (« ledit » sans introduction), description trop courte, effet technique non mentionné |

Un score sur 100 est dérivé de ces anomalies (pénalités par gravité), avec un niveau global (« à retravailler », « perfectible », « solide »). L'interface rappelle explicitement que l'analyse est **indicative** et ne remplace pas l'examen d'un conseiller.

**Listing 2 — Heuristiques du pré-examen** (`src/lib/ai/patent-draft-review.ts`)

```typescript
export type DraftIssueSeverity = "blocker" | "warning" | "tip";

const SEVERITY_PENALTY: Record<DraftIssueSeverity, number> = {
  blocker: 30,
  warning: 12,
  tip: 5,
};

export function analyzeDraftHeuristics(input: DraftReviewInput): DraftIssue[] {
  const issues: DraftIssue[] = [];
  const independent = text(input.independentClaim);

  if (!independent) {
    issues.push({
      id: "no-independent-claim",
      severity: "blocker",
      rule: "Revendication indépendante",
      message: "Aucune revendication indépendante n'est renseignée.",
      suggestion: "Rédigez au moins une revendication indépendante définissant le périmètre.",
    });
  }

  const vague = findVagueTerms(allClaims);
  if (vague.length > 0) {
    issues.push({
      severity: "warning",
      rule: "Termes non bornés",
      message: `Termes vagues détectés : ${vague.join(", ")}.`,
      suggestion: "Remplacez par des caractéristiques techniques mesurables.",
    });
  }
  // … abrégé, description, base d'antériorité, effet technique
}
```

Cinq tests unitaires couvrent ce module (`tests/patent-draft-review.test.ts`). Le lancement se fait via une Server Action (`reviewPatentDraftAction`) qui récupère le brouillon et les revendications en base, après contrôle d'accès au dossier.

## 5.7 Les limites assumées de l'IA

- Les synthèses sont **indicatives** ; le texte produit rappelle explicitement qu'elles ne remplacent pas un avis juridique ;
- La couverture des brevets marocains passe par l'index de l'EPO, et non par une API OMPIC directe ;
- L'offre gratuite de Hugging Face peut introduire de la latence ; un mode de secours, fondé sur des modèles de texte, prend alors le relais.

---

# Chapitre 6 — Tests, résultats et perspectives

## 6.1 Stratégie de tests

| Niveau | Outil | Couverture |
|--------|-------|------------|
| Unitaire | Vitest — **104 tests** | Requêtes EPO, cycles PI, checklists, complétude, pré-examen brevet, similarité, exports… |
| Bout en bout | Playwright | Parcours de démonstration et vérification des accès protégés |
| Manuel | Double session porteur/conseiller | Permissions, parcours complets |

Les commandes de vérification sont volontairement simples :

```bash
npm test          # tests unitaires
npm run test:e2e  # tests de bout en bout
npm run typecheck # vérification des types
npm run build     # build de production
```

## 6.2 Validation par le métier

La validation ne s'est pas faite uniquement par des tests automatiques. Elle s'est appuyée sur des **démonstrations régulières** devant l'encadrante, sur des **scénarios documentés** (un parcours marque et un parcours brevet) et sur une **mise en correspondance** explicite entre les attentes exprimées et les écrans livrés. Cette boucle de retour a été, de loin, le meilleur garde-fou contre les fausses bonnes idées.

## 6.3 Résultats à la clôture

| Élément | État |
|---------|------|
| Parcours porteur → conseiller | Opérationnel |
| Analyses IA (avec service de traitement) | Opérationnel |
| Surveillance des marques en direct | Opérationnel (mode hybride recommandé) |
| Veille technologique | Opérationnel si les clés EPO sont configurées |
| Rédaction et export de brevet | Opérationnel |
| Pré-examen automatique du brouillon | Opérationnel (heuristiques, sans LLM obligatoire) |
| Score de complétude du dossier | Opérationnel (porteur et CPI) |
| Cycle dessin | Gestion du dossier oui ; recherche automatique non |
| Déploiement | Documenté (Vercel + Supabase) |

## 6.4 Difficultés rencontrées

1. **Sécurité au niveau ligne** : des erreurs silencieuses, résolues par des politiques explicites et des migrations correctives.
2. **Absence d'API OMPIC** : contournée par la recherche sur le portail public pour les marques et par l'EPO pour les brevets marocains.
3. **Traitement asynchrone des analyses** : source de confusion en démonstration, d'où une documentation insistante.
4. **Langage de requête EPO** : la confusion entre déposant et pays, corrigée après lecture attentive de la documentation.
5. **Périmètre des dessins** : le renoncement à un faux automatisme au profit d'un message clair pour l'utilisateur.

## 6.5 Perspectives

| Piste | Intérêt |
|-------|---------|
| Passerelle de recherche OMPIC | Industrialiser la recherche en cas de partenariat ou d'accès encadré |
| Historique comparatif de rédaction | Suivre l'évolution des sections d'un brevet |
| Notifications par courriel | Déjà préparé côté configuration |
| Branchement d'une API OMPIC officielle | À connecter si l'office en publie une |
| Renforcement des tests de bout en bout | Couvrir les parcours authentifiés en intégration continue |

---

# Conclusion générale

À la fin de ce stage, PatentIQ est une plateforme cohérente avec la réalité d'un cabinet de conseil en propriété intellectuelle marocain : une collaboration multi-rôles tracée, des cycles différenciés pour la marque, le brevet et le dessin, une IA encadrée et transparente, et une surveillance des marques branchée sur une source réelle.

Mais le résultat dont je suis le plus fier ne tient pas dans une ligne de code. C'est une manière de penser. J'ai compris que, dans ce domaine, **le métier impose l'architecture**. Une simplification qui paraît évidente côté développeur — un seul flux pour tous les titres — devient inacceptable côté conseiller. J'ai appris à écouter avant de coder, à corriger une erreur plutôt qu'à la cacher, et à préférer une limite documentée à une illusion confortable.

PatentIQ reste un produit minimal mais crédible, dont les frontières sont connues et assumées. La suite logique est une mise en production encadrée et un enrichissement progressif, au rythme des retours d'I2PA et de l'évolution des portails officiels.

Sur le plan personnel, ce stage a confirmé mon intérêt pour les projets à **forte contrainte métier**. Derrière chaque écran — une revendication, une alerte de similarité, un cycle de marque — il y a une règle qu'il faut comprendre avant de la traduire en logiciel. C'est plus exigeant qu'une application de gestion classique, et bien plus gratifiant lorsque le parcours devient fluide pour ceux qui l'utilisent vraiment.

---

# Bibliographie et webographie

## Références institutionnelles

- OMPIC — Office marocain de la propriété industrielle et commerciale : https://www.ompic.ma/
- Portail de dépôt en ligne : https://directompic.ma/
- EPO — Open Patent Services, documentation v3.2 : https://developers.epo.org/

## Références techniques

- Next.js 14 — documentation officielle : https://nextjs.org/docs
- Supabase — documentation officielle : https://supabase.com/docs
- Hugging Face — Inference API : https://huggingface.co/docs
- Tailwind CSS : https://tailwindcss.com/docs

## Documentation interne du projet

| Document | Contenu |
|----------|---------|
| `README.md` | Installation, stack, IA |
| `docs/DIAGRAMMES_UML.md` | Diagrammes UML et Gantt |
| `docs/DEMO_ENCADRANTE.md` | Script de démonstration |
| `docs/OMPIC_SURVEILLANCE.md` | Architecture de la surveillance |
| `docs/AI_PROVIDERS.md` | Configuration EPO et Hugging Face |
| `docs/WORKER_AND_DEPLOY.md` | Service de traitement et déploiement |
| `docs/SCHEMA_REFERENCE.md` | Référence du schéma de base de données |

---

# Annexes

## Annexe A — Liste des migrations de base de données

Le dossier `supabase/migrations/` contient 32 fichiers, de `00001_extensions.sql` à `00032_drop_project_commercialization.sql`. Les plus structurants pour la partie métier sont :

- `00003_core_tables.sql` — profils, rôles, projets, documents ;
- `00025_surveillance_claims.sql` — liste de surveillance, alertes, revendications ;
- `00026_veille_commercialization.sql` — veille technologique ;
- `00027_patent_drafts.sql` — rédaction de brevet ;
- `00028_watchlist_portfolio.sql` — portefeuille de surveillance ;
- `00029_ai_search_fto.sql` — type d'analyse « liberté d'exploitation » ;
- `00031_design_surveillance.sql` — métadonnées du cycle dessin.

## Annexe B — Commandes principales

```bash
# Développement
npm install
npm run dev

# Service de traitement des analyses IA (terminal séparé)
npm run ai:worker:loop

# Base de données
npm run db:push

# Qualité et build
npm test
npm run typecheck
npm run build
```

## Annexe C — Variables d'environnement (extrait de `.env.example`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ;
- `EPO_OPS_CONSUMER_KEY`, `EPO_OPS_CONSUMER_SECRET` ;
- `HUGGINGFACE_API_KEY` ;
- `OMPIC_SEARCH_MODE` (valeurs : `live`, `stub`, `proxy`, `hybrid`) ;
- `AI_WORKER_SECRET`.

## Annexe D — Formats et limites techniques

- Types de fichiers acceptés : PDF, Word, PNG, JPEG, CSV ;
- Taille maximale par fichier : 50 Mo ;
- Stockage : deux espaces dédiés (documents de projet et avatars) ;
- Reconnaissance de texte : exécutée localement, sans coût d'API.

## Annexe E — Captures d'écran à insérer dans la version finale

1. Tableau de bord du porteur avec le rappel d'échéances ;
2. Détail d'un dossier brevet — onglet Dossier avec le **score de complétude** ;
3. Détail d'un dossier brevet — onglet Parcours PI (rédaction, **pré-examen** et revendications) ;
4. Analyse de liberté d'exploitation — historique et sources EPO ;
5. Surveillance — recherche de marque et alertes ;
6. Espace conseiller — tableau Kanban et changement de statut ;
7. Page de sécurité — activation de la double authentification.

*(Insérer ici les captures réelles lors de la mise en forme Word ou PDF.)*

## Annexe F — Extraits de code (listings du rapport)

Les listings complets figurent aux sections **4.8** (complétude) et **5.6** (pré-examen). Fichiers sources :

| Listing | Fichier | Tests associés |
|---------|---------|----------------|
| Listing 1 — Score de complétude | `src/lib/projects/completeness.ts` | `tests/project-completeness.test.ts` |
| Listing 2 — Pré-examen brevet | `src/lib/ai/patent-draft-review.ts` | `tests/patent-draft-review.test.ts` |
| Panneau interface complétude | `src/components/dashboard/project-completeness-panel.tsx` | — |
| Panneau interface pré-examen | `src/components/surveillance/patent-draft-review-panel.tsx` | — |

---

*Rapport rédigé par [Prénom NOM] dans le cadre du stage effectué chez I2PA — projet PatentIQ — [mois année].*
