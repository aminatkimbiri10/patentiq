#!/usr/bin/env python3
"""Génère le PDF détaillé de soutenance (contenu approfondi + scripts oraux)."""

from pathlib import Path

from fpdf import FPDF
from fpdf.fonts import FontFace

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "docs" / "SOUTENANCE_DETAILLEE_SCRIPTS.pdf"

# Contenu approfondi par slide : titre, durée, contenu détaillé, script oral, notes démo
SECTIONS = [
    {
        "num": 1,
        "title": "Page de titre — PatentIQ",
        "duration": "45 secondes",
        "content": [
            "Présentation officielle du stage réalisé chez I2PA (International Intellectual Property Assistance), Mohammedia.",
            "Sujet : conception et développement de PatentIQ, plateforme web d'assistance à la propriété intellectuelle.",
            "Public visé : jury académique, encadrante entreprise, éventuellement tuteur pédagogique.",
            "Objectif de la soutenance : démontrer la cohérence métier + technique du livrable, avec honnêteté sur les limites.",
        ],
        "script": """Bonjour à toutes et à tous.

Je m'appelle [Prénom NOM], étudiant(e) en [filière] à [établissement].

J'ai effectué mon stage de [X] semaines au sein d'I2PA — International Intellectual Property Assistance — à Mohammedia, sous la direction de [encadrante] et avec le suivi de [tuteur].

Le sujet de mon stage : la conception et le développement de PatentIQ, une plateforme web d'assistance à la propriété intellectuelle.

Dans les quinze à dix-huit minutes qui suivent, je vais vous présenter le contexte, l'architecture, les fonctionnalités livrées, et ce que ce projet m'a appris — techniquement et sur le plan métier.""",
        "demo": None,
    },
    {
        "num": 2,
        "title": "Plan de la présentation",
        "duration": "30 secondes",
        "content": [
            "Six temps structurés pour guider le jury du général au spécifique.",
            "1. Contexte I2PA et problématique métier.",
            "2. Objectifs du stage et méthode de travail incrémentale.",
            "3. Architecture technique et acteurs (4 rôles).",
            "4. Les quatre piliers fonctionnels : dossier, rédaction, IA, surveillance.",
            "5. Intelligence artificielle encadrée, avec limites documentées.",
            "6. Résultats, difficultés, perspectives et conclusion.",
            "Démo live optionnelle en fin de séance (+5 min).",
        ],
        "script": """Ma présentation s'articule en six temps.

D'abord le contexte I2PA et la problématique qui a motivé le projet.

Ensuite les objectifs et ma méthode de travail.

Puis l'architecture et les acteurs de la plateforme.

Le cœur de la soutenance : les quatre piliers fonctionnels de PatentIQ.

Un point dédié à l'intelligence artificielle, avec ses limites assumées.

Et enfin les résultats, les difficultés rencontrées, et les perspectives.

Si le temps le permet, je pourrai enchaîner sur une démonstration live de l'application.""",
        "demo": None,
    },
    {
        "num": 3,
        "title": "I2PA — Contexte d'accueil",
        "duration": "1 minute",
        "content": [
            "I2PA : cabinet marocain de conseil en PI, Mohammedia (Lot Massira, Résidence Costa del Sol).",
            "Site : i2pa.com — slogan « Protéger, valoriser, innover ».",
            "Activités : brevets, marques, dessins & modèles, veille, surveillance, accompagnement contractuel.",
            "Distinction fondamentale : I2PA conseille et structure ; l'OMPIC (directompic.ma) effectue le dépôt officiel.",
            "PatentIQ = outil interne de travail, pas un portail grand public de dépôt.",
            "Périmètre assumé : préparer, centraliser, suivre — avant et après les démarches OMPIC.",
        ],
        "script": """I2PA est un cabinet marocain spécialisé en propriété intellectuelle, basé à Mohammedia.

Son rôle : accompagner les porteurs de projets et les entreprises dans la protection de leurs innovations — brevets, marques, dessins et modèles — et dans la veille sur leurs titres une fois déposés.

Un point essentiel à comprendre dès le départ : I2PA conseille et structure les dossiers, mais ne dépose pas à la place du client. Le dépôt officiel se fait sur les portails de l'OMPIC, notamment directompic.ma.

PatentIQ a donc été conçu dans ce cadre : préparer, centraliser et suivre un dossier, en amont et en aval des démarches officielles — pas les remplacer.

Le slogan du cabinet résume bien cette mission : « Protéger, valoriser, innover ».""",
        "demo": None,
    },
    {
        "num": 4,
        "title": "Problématique",
        "duration": "1 minute 30",
        "content": [
            "Sans outil dédié : documents éparpillés (emails, PDF), antériorité non reliée au dossier.",
            "Délais incompatibles entre titres : opposition marque ~2 mois vs publication brevet ~18 mois.",
            "Pas d'outil léger adapté au duo porteur ↔ conseiller CPI au Maroc.",
            "Logiciels PI « enterprise » (Questel, PatSnap) : coût et complexité disproportionnés pour I2PA.",
            "Problématique formelle : centraliser + fiabiliser + IA transparente, sans remplacer l'OMPIC.",
            "Citation structurante (encadrante) : « Les systèmes sont différents par rapport aux produits. »",
        ],
        "script": """Concrètement, sans outil dédié, le suivi d'un dossier PI se disperse très vite.

Les pièces justificatives finissent dans des fils de courriels. Une recherche d'antériorité faite une fois n'est jamais rattachée au dossier client. Les délais propres à chaque type de titre se mélangent — alors qu'une marque et un brevet n'ont rien de comparable.

Pour une marque, la fenêtre d'opposition après publication se compte en quelques semaines. Pour un brevet, la publication intervient plutôt autour de dix-huit mois après le dépôt.

La question centrale de mon stage peut se formuler ainsi : Comment doter un cabinet comme I2PA d'un outil capable de centraliser et fiabiliser le suivi d'un dossier PI, sans se substituer à l'OMPIC, tout en intégrant l'IA de manière transparente et honnête ?

Lors d'un point de suivi, mon encadrante m'a aussi dit une phrase qui a structuré tout le développement : « Les systèmes sont différents par rapport aux produits. » — on ne gère pas une marque comme un brevet.""",
        "demo": None,
    },
    {
        "num": 5,
        "title": "Objectifs du stage",
        "duration": "1 minute",
        "content": [
            "Axe 1 — Comprendre : parcours réel dossier PI Maroc (porteur → CPI → expert).",
            "Axe 2 — Développer : PatentIQ par itérations courtes et vérifiables.",
            "Axe 3 — Aligner : prioriser les retours encadrante sur les suppositions techniques.",
            "Axe 4 — Valider : tests automatisés + démo crédible pour la soutenance.",
            "Livrables : application fonctionnelle, 32 migrations SQL, 104+ tests, documentation docs/.",
        ],
        "script": """Mes objectifs se sont articulés en quatre axes.

Premier axe : comprendre le parcours réel d'un dossier PI au Maroc — du porteur au conseiller CPI, en passant par l'expert si besoin.

Deuxième axe : concevoir et développer PatentIQ par itérations courtes — une brique à la fois, testée avant de passer à la suivante.

Troisième axe : aligner les fonctionnalités sur les retours concrets de l'encadrante, plutôt que sur mes propres suppositions techniques.

Quatrième axe : tester, documenter, et préparer une démonstration crédible — celle que je vous présente aujourd'hui.""",
        "demo": None,
    },
    {
        "num": 6,
        "title": "Méthode de travail",
        "duration": "1 minute",
        "content": [
            "Approche incrémentale : migration SQL → Server Action → composant UI → test.",
            "Validation « double session » : 2 navigateurs (porteur + CPI) pour chaque évolution.",
            "Phase 1 : socle (auth, projets, documents, messages, premières analyses IA).",
            "Phase 2 : attentes métier (surveillance, veille, rédaction brevet, Kanban, 2FA).",
            "Phase 3 : consolidation (FTO, opposition, dessin, complétude, pré-examen, UX).",
            "Documentation continue : DEMO_ENCADRANTE.md, DIAGRAMMES_UML.md, rapport de stage.",
        ],
        "script": """Sur le plan méthodologique, j'ai travaillé de façon incrémentale.

Chaque évolution suivait le même schéma : une migration SQL, une action serveur, un composant d'interface — puis validation avant d'avancer.

Ma règle d'or pour tester : la double session. Un navigateur en compte porteur, un autre en compte conseiller CPI. C'est ainsi que j'ai détecté la majorité des problèmes de permissions et de navigation.

Le projet s'est déroulé en trois phases : d'abord le socle collaboratif, puis les attentes métier de l'encadrante, enfin la consolidation et les finitions.

À la clôture : 32 migrations de base de données, plus de cent tests unitaires, et une documentation complète dans le dossier docs/.""",
        "demo": None,
    },
    {
        "num": 7,
        "title": "Architecture technique",
        "duration": "1 minute 30",
        "content": [
            "Frontend : Next.js 14 App Router, React 18, TypeScript strict, Tailwind, shadcn/ui.",
            "Backend intégré : Server Actions (pas de serveur Node séparé).",
            "Données : Supabase PostgreSQL + RLS + Auth (email, MFA TOTP) + Storage (50 Mo/fichier).",
            "Validation : Zod (schémas partagés client/serveur).",
            "APIs externes : EPO OPS (brevets), Hugging Face (LLM), search.ompic.ma (marques).",
            "Workers : traitement IA asynchrone + scan surveillance (local ou GitHub Actions).",
            "Déploiement : Vercel + Supabase cloud (tier gratuit).",
            "Schéma : Navigateur → Next.js → Supabase → services externes.",
        ],
        "script": """Sur le plan technique, j'ai choisi une stack moderne et légère, déployable sans budget cloud initial.

Côté frontend : Next.js 14 avec l'App Router, React, TypeScript, Tailwind CSS et shadcn/ui pour les composants.

Côté backend : pas de serveur séparé — les Server Actions de Next.js parlent directement à Supabase : PostgreSQL pour les données, Auth pour l'authentification, Storage pour les fichiers.

La sécurité repose sur le Row Level Security de PostgreSQL : les permissions sont appliquées en base de données, pas seulement dans l'interface. Un porteur ne peut pas contourner une règle d'accès en manipulant l'URL.

Pour les données externes : l'EPO Open Patent Services pour les brevets, Hugging Face pour les synthèses textuelles, et le portail public search.ompic.ma pour les marques.

Le tout est déployable sur Vercel et Supabase en offre gratuite.""",
        "demo": "Insérer capture ou diagramme architecture (DIAGRAMMES_UML.md).",
    },
    {
        "num": 8,
        "title": "Acteurs et espaces applicatifs",
        "duration": "1 minute",
        "content": [
            "project_holder → /dashboard : création dossier, documents, analyses, suivi.",
            "cpi_advisor → /cpi : revue, statuts, Kanban, portefeuille, surveillance clients.",
            "expert → /expert : avis technique structuré transmis au CPI.",
            "admin → /admin : utilisateurs, paramètres workflow, audit.",
            "7 catégories : brevet, modèle d'utilité, marque, dessin, secret, FTO/veille, autre.",
            "Checklists distinctes par catégorie — brevet ≠ marque ≠ dessin.",
            "Isolation des données : RLS + navigation par rôle.",
        ],
        "script": """PatentIQ distingue quatre rôles.

Le porteur de projet accède à l'espace /dashboard : il crée ses dossiers, dépose des documents, lance des analyses, et suit l'avancement.

Le conseiller CPI a son espace /cpi : il traite les dossiers qui lui sont assignés, fait évoluer les statuts, pilote son portefeuille via un Kanban, et gère la surveillance de ses clients.

L'expert métier intervient sur /expert pour rendre un avis technique structuré.

L'administrateur gère les utilisateurs, les paramètres du workflow et consulte le journal d'audit.

Chaque dossier appartient à l'une de sept catégories — brevet, marque, dessin, etc. — avec une checklist métier adaptée. Ce n'est pas du cosmétique : une checklist brevet et une checklist marque ne portent pas sur les mêmes étapes.""",
        "demo": None,
    },
    {
        "num": 9,
        "title": "Pilier 1 — Dossier collaboratif",
        "duration": "1 minute 30",
        "content": [
            "Structure projet : 3 onglets — Dossier, Analyses IA, Échanges.",
            "Documents versionnés (PDF, Word, PNG, JPEG) — bucket Supabase privé.",
            "OCR local (Tesseract) pour PDF scannés — sans envoi vers API externe.",
            "Checklist métier dynamique selon catégorie (brevet, marque, dessin…).",
            "Score de complétude (0–100 %) : résumé, catégorie, documents, checklist pondérée.",
            "Fonction pure computeProjectCompleteness — testée unitairement.",
            "Workflow 9 statuts : draft → submitted → … → approved/rejected/closed.",
            "Transitions contrôlées par rôle (isCpiStatusTransitionAllowed).",
            "Porteur peut supprimer son dossier (avec confirmation).",
        ],
        "script": """Le premier pilier, c'est le dossier collaboratif.

Chaque projet est organisé en trois onglets : Dossier, Analyses IA, et Échanges — commentaires, messages et tâches.

Les documents sont versionnés et stockés de façon sécurisée : PDF, Word, images, jusqu'à cinquante mégaoctets par fichier.

La checklist guide le porteur étape par étape, selon la catégorie du dossier.

J'ai aussi ajouté un score de complétude : un pourcentage calculé à partir du résumé, des documents déposés et de la progression de la checklist — avec la prochaine action à réaliser. C'est inspiré des outils de docketing des grands cabinets, adapté au contexte I2PA.

Enfin, un workflow à neuf statuts encadre le parcours, du brouillon jusqu'à la clôture — et les transitions dépendent du rôle : un porteur ne peut pas s'auto-approuver un dossier.""",
        "demo": "Tableau de bord porteur → ouvrir un projet → score de complétude en haut de l'onglet Dossier.",
    },
    {
        "num": 10,
        "title": "Pilier 2 — Rédaction & revendications",
        "duration": "1 minute 30",
        "content": [
            "Tables patent_drafts, patent_claims_drafts, patent_draft_versions.",
            "Sections : titre, domaine technique, état de l'art, description, abrégé.",
            "Revendications isolées des messages — confidentialité juridique.",
            "Pré-examen heuristique (analyzeDraftHeuristics) : blocker / warning / tip.",
            "Règles : rev. indépendante, abrégé ≤ 150 mots, termes vagues, base d'antériorité.",
            "Score /100 + suggestions — indicatif, pas avis juridique.",
            "Aide rédaction IA (Hugging Face) + export PDF dossier brevet.",
            "Historique des versions de rédaction.",
        ],
        "script": """Le deuxième pilier concerne la rédaction de brevet et les revendications.

Le brouillon est structuré en sections : titre, domaine technique, état de l'art, description, abrégé.

Les revendications vivent dans un espace dédié et séparé des messages ouverts — parce qu'une revendication est confidentielle et engageante ; elle ne doit pas se retrouver dans un fil de discussion général.

J'ai implémenté un pré-examen automatique : avant la revue CPI, le système détecte les anomalies les plus fréquentes — absence de revendication indépendante, abrégé trop long, termes vagues, problèmes de base d'antériorité. Ce n'est pas une validation juridique ; c'est une aide à la relecture, basée sur des règles testables.

Le conseiller peut aussi exporter le dossier brevet en PDF.""",
        "demo": "Parcours PI → Rédaction → bouton « Lancer le pré-examen ».",
    },
    {
        "num": 11,
        "title": "Pilier 3 — Analyses IA assistées",
        "duration": "1 minute 30",
        "content": [
            "7 types : nouveauté, FTO, sémantique, similarité, résumé, classification IPC, tags.",
            "Pipeline : lancement → ai_searches (pending) → worker → ai_results + synthèse.",
            "Sources : EPO OPS international + pn=MA (publications marocaines) + OMPIC marques.",
            "LLM : Hugging Face (Qwen2.5-7B-Instruct configurable) — fallback template.",
            "Chat assistant contextuel par dossier (RAG léger par mots-clés).",
            "Incident corrigé : pa=MA (déposant) confondu avec pn=MA (pays publication).",
            "Toutes synthèses marquées « indicatif — ne remplace pas avis CPI ».",
            "Commande worker : npm run ai:worker:loop (documenté).",
        ],
        "script": """Le troisième pilier, c'est l'intelligence artificielle assistive.

Sept types d'analyses sont disponibles : nouveauté, liberté d'exploitation — la FTO —, analyse sémantique, similarité, résumé de document, classification IPC, et suggestions de tags.

Les sources sont réelles : brevets internationaux via l'EPO, publications marocaines via le filtre pn=MA, marques via le portail OMPIC.

Le traitement est asynchrone : l'utilisateur lance l'analyse, elle passe en « en attente », un worker la traite, puis les résultats s'affichent. C'est documenté — sans worker actif, l'analyse reste en attente. J'ai préféré cette honnêteté à une fausse promesse de résultat instantané.

Toutes les synthèses rappellent qu'elles sont indicatives et ne remplacent pas un avis juridique.

J'ai aussi corrigé un incident réel : une requête EPO utilisait pa=MA — le déposant — au lieu de pn=MA — le pays de publication. La correction est testée unitairement.""",
        "demo": "Onglet Analyses IA → historique ou lancer « Nouveauté » (worker actif).",
    },
    {
        "num": 12,
        "title": "Pilier 4 — Surveillance & veille",
        "duration": "1 minute 30",
        "content": [
            "Watchlist (ip_watchlist) + alertes similarité (ip_watch_alerts).",
            "Recherche marques : portail public search.ompic.ma (pas d'API REST officielle).",
            "Modes OMPIC : live, stub (démo), proxy (n8n), hybrid — documentés.",
            "Veille techno (ip_tech_watch) : mots-clés + IPC sur brevets EPO.",
            "Échéances PI : opposition marque, publication brevet — panneau tableau de bord.",
            "Fiche opposition sur alerte marque.",
            "Dessins : cycle gestion oui, recherche auto non (transparence).",
            "Scan planifiable : GitHub Actions surveillance-scan.yml.",
        ],
        "script": """Le quatrième pilier : surveillance et veille.

La watchlist permet de suivre les titres enregistrés et de lancer des scans de similarité sur search.ompic.ma — le portail public des marques.

Comme l'OMPIC ne publie pas d'API officielle, j'ai conçu un fournisseur configurable : mode live, stub pour démo hors ligne, proxy, ou hybride. Chaque mode est documenté — je ne simule pas une API officielle qui n'existe pas.

La veille technologique suit des mots-clés et des classes IPC sur les brevets EPO.

Des rappels d'échéances s'affichent sur le tableau de bord : fenêtre d'opposition pour les marques, attente de publication pour les brevets.

Pour les dessins et modèles, j'ai conservé le cycle de gestion du dossier, mais sans moteur de recherche automatique — faute d'API OMPIC. C'est un choix de transparence assumé.""",
        "demo": "Surveillance → recherche marque → watchlist → alertes.",
    },
    {
        "num": 13,
        "title": "Cycles de vie distincts",
        "duration": "1 minute",
        "content": [
            "Marque : dépôt → publié → opposition ~2 mois → enregistré → surveillance.",
            "Brevet : dépôt → examen → publication ~18 mois → délivrance → veille.",
            "Dessin : dépôt → examen → publication → surveillance manuelle.",
            "Métadonnées cycles stockées dans projects.metadata.",
            "Libellés UI dynamiques (getProjectSummaryLabels) : marque ≠ brevet.",
            "Réponse directe à : « Les systèmes sont différents par rapport aux produits. »",
        ],
        "script": """Cette slide résume la leçon métier la plus importante du stage.

Marque : dépôt, publication, opposition d'environ deux mois, enregistrement, puis surveillance continue.

Brevet : dépôt, examen, attente de publication d'environ dix-huit mois, délivrance, puis veille.

Dessin et modèle : dépôt, examen, publication, surveillance — avec recherche d'antériorité visuelle manuelle sur les portails officiels.

Même l'interface reflète cette distinction : pour une marque, on parle de « description de la marque » ; pour un brevet, de « résumé de l'invention » — parce qu'une marque n'est pas une invention technique.

C'est la traduction concrète de la remarque de mon encadrante.""",
        "demo": None,
    },
    {
        "num": 14,
        "title": "Fonctionnalités avancées",
        "duration": "1 minute",
        "content": [
            "Tableau de bord portefeuille CPI (/cpi/reports) : KPIs, répartition statuts/types.",
            "Claim chart : matrice revendications vs antériorité (IA + fallback template).",
            "Générateur dénominations marque + vérification OMPIC inline.",
            "Assistance réponse irrégularités OMPIC (brouillon courrier structuré).",
            "Score complétude + pré-examen (fonctions pures, tests Vitest).",
            "Inspiré outils marché (Questel, PatSnap, Anaqua) — échelle MVP I2PA.",
            "Toutes basées sur données réelles du dossier — pas de fake data en démo.",
        ],
        "script": """En fin de stage, j'ai enrichi la plateforme avec plusieurs modules inspirés d'outils professionnels du marché — à l'échelle d'un MVP.

Un tableau de bord portefeuille pour le CPI : répartition par statut et par type de PI.

Une cartographie des revendications face à l'antériorité — un claim chart simplifié.

Un générateur de dénominations pour les projets marque, avec vérification OMPIC en un clic.

Une assistance à la réponse aux irrégularités OMPIC : brouillon structuré à partir d'une notification reçue.

Et les modules déjà cités : score de complétude et pré-examen de brouillon.

Tous s'appuient sur des données réelles du dossier — pas de catalogue simulé présenté comme officiel.""",
        "demo": "Optionnel : /cpi/reports ou générateur dénominations (projet marque).",
    },
    {
        "num": 15,
        "title": "Sécurité & confidentialité",
        "duration": "45 secondes",
        "content": [
            "RLS PostgreSQL : can_view_project(), can_edit_project(), has_role()…",
            "Policies SELECT/INSERT/UPDATE sur chaque table sensible.",
            "Auth : email confirmé, MFA TOTP (/dashboard/security).",
            "Stockage : buckets privés, URLs signées pour avatars/documents.",
            "Audit logs : actions sensibles tracées (admin).",
            "Difficulté : policies mal écrites → résultats vides sans erreur UI.",
        ],
        "script": """Sur la sécurité, trois points clés.

Un : le Row Level Security PostgreSQL, avec des fonctions centralisées comme can_view_project — admin, propriétaire, membre, CPI assigné, expert.

Deux : l'authentification — email confirmé, double facteur TOTP disponible.

Trois : le journal d'audit pour les actions sensibles côté administrateur.

La difficulté la plus marquante ici : une policy mal écrite renvoie parfois un résultat vide sans message d'erreur. J'ai appris à tester systématiquement avec deux comptes après chaque migration.""",
        "demo": None,
    },
    {
        "num": 16,
        "title": "Tests & validation",
        "duration": "45 secondes",
        "content": [
            "Vitest : 104+ tests — EPO, cycles PI, complétude, pré-examen, OMPIC, exports.",
            "Playwright : parcours login, dashboard, navigation projet.",
            "Manuel : double session porteur/CPI, grille 12 scénarios (rapport §6).",
            "Validation métier : démos encadrante, DEMO_PREP_PRIORITE1.md.",
            "CI locale : npm test && npm run typecheck && npm run build.",
        ],
        "script": """La qualité est assurée à trois niveaux.

Plus de cent tests unitaires avec Vitest — requêtes EPO, cycles PI, score de complétude, pré-examen brevet, similarité OMPIC.

Des tests de bout en bout Playwright sur les parcours critiques.

Et une validation métier continue : démonstrations devant l'encadrante, scénarios marque et brevet documentés.

Les commandes npm test, npm run typecheck et npm run build passent au vert avant chaque livraison.""",
        "demo": None,
    },
    {
        "num": 17,
        "title": "Résultats à la clôture",
        "duration": "45 secondes",
        "content": [
            "✓ Parcours porteur → CPI opérationnel.",
            "✓ Analyses IA (avec worker) + surveillance OMPIC hybrid.",
            "✓ Rédaction brevet, revendications, export PDF.",
            "✓ Cycles marque / brevet / dessin différenciés.",
            "✓ Pré-examen + complétude + modules avancés.",
            "✓ 32 migrations, documentation complète, déploiement Vercel documenté.",
            "MVP crédible pour démo et pilote I2PA.",
        ],
        "script": """À la clôture du stage, les éléments suivants sont opérationnels :

le parcours complet porteur vers conseiller ;

les analyses IA, avec le worker ;

la surveillance OMPIC en mode hybride ;

la rédaction et l'export de brevet ;

les cycles différenciés marque, brevet et dessin ;

le pré-examen et le score de complétude ;

et un déploiement documenté sur Vercel et Supabase.

C'est un MVP crédible pour une démonstration et un usage pilote chez I2PA.""",
        "demo": None,
    },
    {
        "num": 18,
        "title": "Limites assumées",
        "duration": "1 minute",
        "content": [
            "Pas d'API OMPIC officielle — portail public + modes documentés.",
            "Worker IA requis pour analyses (pas de traitement synchrone illusoire).",
            "Synthèses indicatives — décision juridique = CPI humain.",
            "Dessins : pas de recherche auto (refus de simuler des résultats).",
            "Pas de fine-tuning LLM — modèles pré-entraînés + prompt engineering.",
            "MVP, pas équivalent Questel / PatSnap / Anaqua.",
            "Principe : « une limite documentée vaut mieux qu'une illusion confortable ».",
        ],
        "script": """Je préfère être transparent sur les limites — le jury les posera de toute façon.

Il n'existe pas d'API OMPIC officielle : la recherche marques passe par le portail public.

Les analyses IA nécessitent un worker actif — ce n'est pas magique en un clic sans infrastructure.

Les synthèses restent indicatives : la décision appartient au CPI.

Pour les dessins, pas de recherche automatique — plutôt que de simuler des résultats faux.

Et PatentIQ reste un produit minimal, pas un logiciel commercial complet type Questel ou PatSnap.

Comme je l'écris dans mon rapport : une limite documentée vaut mieux qu'une illusion confortable.""",
        "demo": None,
    },
    {
        "num": 19,
        "title": "Perspectives",
        "duration": "30 secondes",
        "content": [
            "Passerelle OMPIC industrialisée (partenariat / proxy encadré).",
            "Notifications email transactionnelles.",
            "RAG vectoriel (embeddings) pour le chat et les analyses.",
            "Tests E2E authentifiés en CI GitHub Actions.",
            "Mise en production pilote chez I2PA après validation encadrée.",
        ],
        "script": """Les perspectives sont naturelles : industrialiser la passerelle OMPIC, activer les notifications email, enrichir le RAG avec des embeddings vectoriels, renforcer les tests E2E en intégration continue, et envisager une mise en production encadrée chez I2PA.""",
        "demo": None,
    },
    {
        "num": 20,
        "title": "Conclusion",
        "duration": "1 minute",
        "content": [
            "PatentIQ = espace de travail PI pour I2PA : collaboration, antériorité, surveillance.",
            "Le métier impose l'architecture — marque ≠ brevet ≠ dessin.",
            "Dépôt officiel reste sur directompic.ma (périmètre volontaire).",
            "Apports personnels : full-stack métier, APIs réelles, honnêteté produit.",
            "Remerciements : équipe I2PA, encadrante, tuteur académique.",
        ],
        "script": """Pour conclure.

PatentIQ structure la préparation et le suivi d'un dossier de propriété intellectuelle pour un cabinet comme I2PA : collaboration multi-acteurs, antériorité assistée, surveillance OMPIC, cycles différenciés.

Le dépôt officiel reste sur directompic.ma — et c'est voulu.

Sur le plan personnel, ce stage m'a appris que le métier impose l'architecture. Écouter avant de coder. Corriger plutôt que masquer. Et livrer quelque chose d'honnête.

Je remercie l'équipe I2PA, mon encadrante [nom] pour ses retours qui ont orienté chaque itération, et mon tuteur [nom] pour son suivi académique.""",
        "demo": None,
    },
    {
        "num": 21,
        "title": "Questions & démo",
        "duration": "30 secondes + Q&R",
        "content": [
            "Ouverture aux questions du jury.",
            "Démo live optionnelle : parcours marque (10 min) ou brevet (10 min).",
            "Prérequis démo : npm run dev + npm run ai:worker:loop.",
            "Comptes porteur + CPI avec email confirmé.",
            "Guide : docs/DEMO_ENCADRANTE.md.",
        ],
        "script": """Je vous remercie pour votre attention.

Je suis disponible pour vos questions.

Si vous le souhaitez, je peux également vous montrer une démonstration live de l'application — parcours marque ou brevet.""",
        "demo": "Basculer sur localhost:3000 si le jury accepte la démo.",
    },
]

JURY_QA = [
    (
        "Pourquoi ne pas utiliser Questel, PatSnap ou un logiciel existant ?",
        "Ces solutions ciblent de grands cabinets, avec un coût et une complexité disproportionnés pour I2PA. PatentIQ est un MVP sur mesure, centré OMPIC et le contexte marocain, hébergeable à faible coût, avec des limites documentées plutôt que des promesses excessives.",
    ),
    (
        "L'IA remplace-t-elle le conseiller en propriété industrielle ?",
        "Non. L'IA assiste : antériorité, synthèse, pré-examen heuristique, chat contextuel. Chaque écran rappelle que le résultat est indicatif. La décision juridique et la stratégie de dépôt restent humaines.",
    ),
    (
        "Comment gérez-vous l'absence d'API OMPIC ?",
        "Recherche marques via le portail public search.ompic.ma. Modes live, proxy n8n, stub démo et hybrid — tous documentés dans OMPIC_SURVEILLANCE.md. Brevets marocains via l'index EPO avec le filtre pn=MA. Aucun faux connecteur « API officielle ».",
    ),
    (
        "Qu'avez-vous appris personnellement durant ce stage ?",
        "Traduire une règle métier PI en architecture logicielle. La remarque « marque ≠ brevet » a changé des semaines de développement. L'importance de tester avec deux rôles simultanément. Et la valeur d'une limite documentée face au jury comme face à l'utilisateur.",
    ),
    (
        "Le projet est-il déployé en production ?",
        "Déployable sur Vercel + Supabase cloud. Documentation WORKER_AND_DEPLOY.md. Usage pilote chez I2PA envisageable après validation encadrée et configuration des secrets (EPO, HF, OMPIC).",
    ),
    (
        "Pourquoi pas de recherche automatique pour les dessins ?",
        "L'OMPIC n'expose pas d'API publique pour les dessins. L'EPO ne propose pas de recherche comparable à celle des marques. Simuler un catalogue permanent serait trompeur en démo. J'ai conservé le cycle de gestion du dossier avec liens vers les portails officiels.",
    ),
]


class SoutenancePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f"PatentIQ — Soutenance I2PA — Page {self.page_no()}", align="C")


def section_heading(pdf: SoutenancePDF, text: str, level: int = 1):
    pdf.ln(4)
    if level == 1:
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(10, 102, 194)
    else:
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(30, 41, 59)
    pdf.multi_cell(0, 7, text)
    pdf.ln(2)


def body_text(pdf: SoutenancePDF, text: str, indent: int = 0):
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 41, 59)
    x = pdf.get_x()
    if indent:
        pdf.set_x(x + indent)
    pdf.multi_cell(0, 5.5, text)
    pdf.ln(1)


def bullet_list(pdf: SoutenancePDF, items: list[str]):
    for item in items:
        body_text(pdf, f"  •  {item}")


def script_block(pdf: SoutenancePDF, script: str):
    pdf.set_fill_color(240, 247, 255)
    pdf.set_draw_color(10, 102, 194)
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(30, 41, 59)
    for paragraph in script.strip().split("\n\n"):
        pdf.multi_cell(0, 5.5, paragraph.strip(), border=0, fill=True)
        pdf.ln(3)


def main():
    pdf = SoutenancePDF()
    pdf.add_page()

    # Page de garde
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(10, 102, 194)
    pdf.cell(0, 12, "PatentIQ", ln=True, align="C")
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "Guide de soutenance detaille", ln=True, align="C")
    pdf.cell(0, 8, "Contenu approfondi + scripts oraux", ln=True, align="C")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 11)
    body_text(
        pdf,
        "Document de preparation — [Prenom NOM] — Stage I2PA — [Dates]\n"
        "Duree cible : 15-18 min (slides) + 5 min demo optionnelle + questions\n"
        "Fichiers associes : SOUTENANCE_PATENTIQ_SCRIPTS.pptx · RAPPORT_DE_STAGE_COMPLET.md",
    )
    pdf.ln(4)
    section_heading(pdf, "Timing recapitulatif", 2)
    bullet_list(
        pdf,
        [
            "Intro + contexte (slides 1-4) : ~4 min",
            "Objectifs + methode + architecture (5-8) : ~5 min",
            "4 piliers + cycles (9-13) : ~7 min",
            "Avance + securite + tests + bilan (14-18) : ~4 min",
            "Conclusion + questions (19-21) : ~2 min",
            "Demo live optionnelle : +5 min",
        ],
    )

    for sec in SECTIONS:
        pdf.add_page()
        section_heading(pdf, f"Slide {sec['num']} — {sec['title']}")
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, f"Duree conseillee : {sec['duration']}", ln=True)
        pdf.ln(2)

        section_heading(pdf, "Contenu detaille (support visuel)", 2)
        bullet_list(pdf, sec["content"])

        if sec.get("demo"):
            pdf.ln(2)
            section_heading(pdf, "Point demo", 2)
            body_text(pdf, sec["demo"])

        pdf.ln(2)
        section_heading(pdf, "Script oral — a dire a voix haute", 2)
        script_block(pdf, sec["script"])

    pdf.add_page()
    section_heading(pdf, "Annexe — Banque de reponses au jury")
    pdf.ln(2)
    for question, answer in JURY_QA:
        section_heading(pdf, f"Q : {question}", 2)
        body_text(pdf, f"R : {answer}")
        pdf.ln(3)

    pdf.add_page()
    section_heading(pdf, "Annexe — Checklist jour J (demo live)")
    bullet_list(
        pdf,
        [
            "Terminal 1 : npm run dev",
            "Terminal 2 : npm run ai:worker:loop",
            "Verifier .env.local : SUPABASE, EPO_OPS, HUGGINGFACE, OMPIC_SEARCH_MODE=hybrid",
            "Comptes porteur + CPI : emails confirmes",
            "2 projets prets : 1 marque, 1 brevet (documents + checklist partielle)",
            "Fermer onglets inutiles — 2 navigateurs ou 2 profils pour double session",
            "Guide complet : docs/DEMO_ENCADRANTE.md",
        ],
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUTPUT))
    print(f"PDF genere : {OUTPUT}")
    print(f"Sections : {len(SECTIONS)} slides + annexes jury et demo")


if __name__ == "__main__":
    main()
