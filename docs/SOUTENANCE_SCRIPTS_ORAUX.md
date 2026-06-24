# Scripts oraux — Soutenance PatentIQ

**Durée cible :** 15 à 18 minutes (slides) + 5 min démo optionnelle + questions  
**Fichier PowerPoint :** `docs/SOUTENANCE_PATENTIQ_SCRIPTS.pptx` (21 slides + scripts dans les notes)  
**Guide PDF détaillé :** `docs/SOUTENANCE_DETAILLEE_SCRIPTS.pdf` (contenu approfondi + scripts + Q&R jury)  
**Régénérer le PDF :** `python scripts/generate-soutenance-pdf-html.py`

**Voir les scripts pendant la présentation :** PowerPoint → **Affichage** → **Moniteur de présentateur** (les notes s'affichent sous la slide).

> Remplace `[Prénom]`, `[Encadrante]`, les dates, etc. avant de répéter à voix haute.

---

## Slide 1 — Titre · ~45 s

Bonjour à toutes et à tous.

Je m'appelle **[Prénom NOM]**, étudiant(e) en **[filière]** à **[établissement]**.

J'ai effectué mon stage de **[X] semaines** au sein d'**I2PA** — International Intellectual Property Assistance — à Mohammedia, sous la direction de **[encadrante]** et avec le suivi de **[tuteur]**.

Le sujet de mon stage : la conception et le développement de **PatentIQ**, une plateforme web d'assistance à la propriété intellectuelle.

Dans les quinze minutes qui suivent, je vais vous présenter le contexte, l'architecture, les fonctionnalités livrées, et ce que ce projet m'a appris — techniquement et sur le plan métier.

---

## Slide 2 — Plan · ~30 s

Ma présentation s'articule en six temps.

D'abord le **contexte I2PA** et la problématique qui a motivé le projet.

Ensuite les **objectifs** et ma **méthode de travail**.

Puis l'**architecture** et les **acteurs** de la plateforme.

Le cœur de la soutenance : les **quatre piliers fonctionnels** de PatentIQ.

Un point dédié à l'**intelligence artificielle**, avec ses limites assumées.

Et enfin les **résultats**, les difficultés rencontrées, et les **perspectives**.

Si le temps le permet, je pourrai enchaîner sur une **démonstration live** de l'application.

---

## Slide 3 — I2PA · ~1 min

**I2PA** est un cabinet marocain spécialisé en propriété intellectuelle, basé à Mohammedia.

Son rôle : accompagner les porteurs de projets et les entreprises dans la protection de leurs innovations — brevets, marques, dessins et modèles — et dans la veille sur leurs titres une fois déposés.

Un point essentiel à comprendre dès le départ : **I2PA conseille et structure les dossiers, mais ne dépose pas à la place du client**. Le dépôt officiel se fait sur les portails de l'**OMPIC**, notamment **directompic.ma**.

PatentIQ a donc été conçu dans ce cadre : **préparer, centraliser et suivre** un dossier, en amont et en aval des démarches officielles — pas les remplacer.

Le slogan du cabinet résume bien cette mission : *« Protéger, valoriser, innover »*.

---

## Slide 4 — Problématique · ~1 min 30

Concrètement, sans outil dédié, le suivi d'un dossier PI se disperse très vite.

Les pièces justificatives finissent dans des fils de courriels. Une recherche d'antériorité faite une fois n'est jamais rattachée au dossier client. Les délais propres à chaque type de titre se mélangent — alors qu'une **marque** et un **brevet** n'ont rien de comparable.

Pour une marque, la fenêtre d'**opposition** après publication se compte en **quelques semaines**. Pour un brevet, la **publication** intervient plutôt autour de **dix-huit mois** après le dépôt.

La question centrale de mon stage peut se formuler ainsi :

> *Comment doter un cabinet comme I2PA d'un outil capable de centraliser et fiabiliser le suivi d'un dossier PI, sans se substituer à l'OMPIC, tout en intégrant l'IA de manière transparente et honnête ?*

Lors d'un point de suivi, mon encadrante m'a aussi dit une phrase qui a structuré tout le développement : *« Les systèmes sont différents par rapport aux produits. »* — on ne gère pas une marque comme un brevet.

---

## Slide 5 — Objectifs · ~1 min

Mes objectifs se sont articulés en quatre axes.

**Premier axe :** comprendre le parcours réel d'un dossier PI au Maroc — du porteur au conseiller CPI, en passant par l'expert si besoin.

**Deuxième axe :** concevoir et développer PatentIQ par **itérations courtes** — une brique à la fois, testée avant de passer à la suivante.

**Troisième axe :** aligner les fonctionnalités sur les **retours concrets de l'encadrante**, plutôt que sur mes propres suppositions techniques.

**Quatrième axe :** tester, documenter, et préparer une **démonstration crédible** — celle que je vous présente aujourd'hui.

---

## Slide 6 — Méthode · ~1 min

Sur le plan méthodologique, j'ai travaillé de façon **incrémentale**.

Chaque évolution suivait le même schéma : une **migration SQL**, une **action serveur**, un **composant d'interface** — puis validation avant d'avancer.

Ma règle d'or pour tester : la **double session**. Un navigateur en compte **porteur**, un autre en compte **conseiller CPI**. C'est ainsi que j'ai détecté la majorité des problèmes de permissions et de navigation.

Le projet s'est déroulé en **trois phases** : d'abord le socle collaboratif, puis les attentes métier de l'encadrante, enfin la consolidation et les finitions.

À la clôture : **32 migrations** de base de données, plus de **cent tests unitaires**, et une documentation complète dans le dossier `docs/`.

---

## Slide 7 — Architecture · ~1 min 30

Sur le plan technique, j'ai choisi une stack **moderne et légère**, déployable sans budget cloud initial.

Côté **frontend** : **Next.js 14** avec l'App Router, **React**, **TypeScript**, **Tailwind CSS** et **shadcn/ui** pour les composants.

Côté **backend** : pas de serveur séparé — les **Server Actions** de Next.js parlent directement à **Supabase** : PostgreSQL pour les données, Auth pour l'authentification, Storage pour les fichiers.

La **sécurité** repose sur le **Row Level Security** de PostgreSQL : les permissions sont appliquées **en base de données**, pas seulement dans l'interface. Un porteur ne peut pas contourner une règle d'accès en manipulant l'URL.

Pour les données externes : l'**EPO Open Patent Services** pour les brevets, **Hugging Face** pour les synthèses textuelles, et le portail public **search.ompic.ma** pour les marques.

Le tout est déployable sur **Vercel** et **Supabase** en offre gratuite.

*(Si tu as inséré un schéma : « Comme le montre ce diagramme, le navigateur communique en HTTPS avec Next.js, qui s'appuie sur Supabase et les APIs externes. »)*

---

## Slide 8 — Acteurs · ~1 min

PatentIQ distingue **quatre rôles**.

Le **porteur de projet** accède à l'espace `/dashboard` : il crée ses dossiers, dépose des documents, lance des analyses, et suit l'avancement.

Le **conseiller CPI** a son espace `/cpi` : il traite les dossiers qui lui sont assignés, fait évoluer les statuts, pilote son portefeuille via un Kanban, et gère la surveillance de ses clients.

L'**expert métier** intervient sur `/expert` pour rendre un avis technique structuré.

L'**administrateur** gère les utilisateurs, les paramètres du workflow et consulte le journal d'audit.

Chaque dossier appartient à l'une de **sept catégories** — brevet, marque, dessin, etc. — avec une **checklist métier** adaptée. Ce n'est pas du cosmétique : une checklist brevet et une checklist marque ne portent pas sur les mêmes étapes.

---

## Slide 9 — Pilier 1 · ~1 min 30

**[→ DÉMO possible : tableau de bord porteur]**

Le premier pilier, c'est le **dossier collaboratif**.

Chaque projet est organisé en trois onglets : **Dossier**, **Analyses IA**, et **Échanges** — commentaires, messages et tâches.

Les documents sont **versionnés** et stockés de façon sécurisée : PDF, Word, images, jusqu'à cinquante mégaoctets par fichier.

La **checklist** guide le porteur étape par étape, selon la catégorie du dossier.

J'ai aussi ajouté un **score de complétude** : un pourcentage calculé à partir du résumé, des documents déposés et de la progression de la checklist — avec la **prochaine action** à réaliser. C'est inspiré des outils de *docketing* des grands cabinets, adapté au contexte I2PA.

Enfin, un **workflow à neuf statuts** encadre le parcours, du brouillon jusqu'à la clôture — et les transitions dépendent du **rôle** : un porteur ne peut pas s'auto-approuver un dossier.

---

## Slide 10 — Pilier 2 · ~1 min 30

**[→ DÉMO possible : Parcours PI → Rédaction → Pré-examen]**

Le deuxième pilier concerne la **rédaction de brevet** et les **revendications**.

Le brouillon est structuré en sections : titre, domaine technique, état de l'art, description, abrégé.

Les **revendications** vivent dans un espace **dédié et séparé** des messages ouverts — parce qu'une revendication est confidentielle et engageante ; elle ne doit pas se retrouver dans un fil de discussion général.

J'ai implémenté un **pré-examen automatique** : avant la revue CPI, le système détecte les anomalies les plus fréquentes — absence de revendication indépendante, abrégé trop long, termes vagues, problèmes de base d'antériorité. Ce n'est pas une validation juridique ; c'est une **aide à la relecture**, basée sur des règles testables.

Le conseiller peut aussi **exporter** le dossier brevet en PDF.

---

## Slide 11 — Pilier 3 · ~1 min 30

**[→ DÉMO possible : historique analyses IA ou lancement nouveauté]**

Le troisième pilier, c'est l'**intelligence artificielle assistive**.

Sept types d'analyses sont disponibles : nouveauté, liberté d'exploitation — la FTO —, analyse sémantique, similarité, résumé de document, classification IPC, et suggestions de tags.

Les sources sont **réelles** : brevets internationaux via l'EPO, publications marocaines via le filtre **`pn=MA`**, marques via le portail OMPIC.

Le traitement est **asynchrone** : l'utilisateur lance l'analyse, elle passe en « en attente », un **worker** la traite, puis les résultats s'affichent. C'est documenté — sans worker actif, l'analyse reste en attente. J'ai préféré cette honnêteté à une fausse promesse de résultat instantané.

Toutes les synthèses rappellent qu'elles sont **indicatives** et ne remplacent pas un avis juridique.

J'ai aussi corrigé un incident réel : une requête EPO utilisait `pa=MA` — le déposant — au lieu de `pn=MA` — le pays de publication. Résultat : des 404 et des analyses incomplètes. La correction est testée unitairement.

---

## Slide 12 — Pilier 4 · ~1 min 30

**[→ DÉMO possible : Surveillance → recherche marque]**

Le quatrième pilier : **surveillance et veille**.

La **watchlist** permet de suivre les titres enregistrés et de lancer des scans de similarité sur **search.ompic.ma** — le portail public des marques.

Comme l'OMPIC ne publie pas d'API officielle, j'ai conçu un fournisseur **configurable** : mode live, stub pour démo hors ligne, proxy, ou hybride. Chaque mode est **documenté** — je ne simule pas une API officielle qui n'existe pas.

La **veille technologique** suit des mots-clés et des classes IPC sur les brevets EPO.

Des **rappels d'échéances** s'affichent sur le tableau de bord : fenêtre d'opposition pour les marques, attente de publication pour les brevets.

Pour les **dessins et modèles**, j'ai conservé le cycle de gestion du dossier, mais **sans moteur de recherche automatique** — faute d'API OMPIC. C'est un choix de transparence assumé.

---

## Slide 13 — Cycles de vie · ~1 min

Cette slide résume la leçon métier la plus importante du stage.

**Marque** : dépôt, publication, opposition d'environ **deux mois**, enregistrement, puis surveillance continue.

**Brevet** : dépôt, examen, attente de publication d'environ **dix-huit mois**, délivrance, puis veille.

**Dessin et modèle** : dépôt, examen, publication, surveillance — avec recherche d'antériorité visuelle **manuelle** sur les portails officiels.

Même l'interface reflète cette distinction : pour une marque, on parle de **« description de la marque »** ; pour un brevet, de **« résumé de l'invention »** — parce qu'une marque n'est pas une invention technique.

C'est la traduction concrète de la remarque de mon encadrante.

---

## Slide 14 — Fonctionnalités avancées · ~1 min

En fin de stage, j'ai enrichi la plateforme avec plusieurs modules inspirés d'outils professionnels du marché — à l'échelle d'un MVP.

Un **tableau de bord portefeuille** pour le CPI : répartition par statut et par type de PI.

Une **cartographie des revendications** face à l'antériorité — un *claim chart* simplifié.

Un **générateur de dénominations** pour les projets marque, avec vérification OMPIC en un clic.

Une **assistance à la réponse** aux irrégularités OMPIC : brouillon structuré à partir d'une notification reçue.

Et les modules déjà cités : **score de complétude** et **pré-examen de brouillon**.

Tous s'appuient sur des **données réelles** du dossier — pas de catalogue simulé présenté comme officiel.

---

## Slide 15 — Sécurité · ~45 s

Sur la sécurité, trois points clés.

**Un** : le Row Level Security PostgreSQL, avec des fonctions centralisées comme `can_view_project` — admin, propriétaire, membre, CPI assigné, expert.

**Deux** : l'authentification — email confirmé, double facteur TOTP disponible.

**Trois** : le journal d'audit pour les actions sensibles côté administrateur.

La difficulté la plus marquante ici : une policy mal écrite renvoie parfois un résultat **vide sans message d'erreur**. J'ai appris à tester systématiquement avec deux comptes après chaque migration.

---

## Slide 16 — Tests · ~45 s

La qualité est assurée à trois niveaux.

Plus de **cent tests unitaires** avec Vitest — requêtes EPO, cycles PI, score de complétude, pré-examen brevet, similarité OMPIC.

Des **tests de bout en bout** Playwright sur les parcours critiques.

Et une **validation métier** continue : démonstrations devant l'encadrante, scénarios marque et brevet documentés.

Les commandes `npm test`, `npm run typecheck` et `npm run build` passent au vert avant chaque livraison.

---

## Slide 17 — Résultats · ~45 s

À la clôture du stage, les éléments suivants sont **opérationnels** :

le parcours complet porteur vers conseiller ;

les analyses IA, avec le worker ;

la surveillance OMPIC en mode hybride ;

la rédaction et l'export de brevet ;

les cycles différenciés marque, brevet et dessin ;

le pré-examen et le score de complétude ;

et un déploiement documenté sur Vercel et Supabase.

C'est un **MVP crédible** pour une démonstration et un usage pilote chez I2PA.

---

## Slide 18 — Limites · ~1 min

Je préfère être transparent sur les **limites** — le jury les posera de toute façon.

Il n'existe **pas d'API OMPIC officielle** : la recherche marques passe par le portail public.

Les analyses IA nécessitent un **worker actif** — ce n'est pas magique en un clic sans infrastructure.

Les synthèses restent **indicatives** : la décision appartient au CPI.

Pour les **dessins**, pas de recherche automatique — plutôt que de simuler des résultats faux.

Et PatentIQ reste un **produit minimal**, pas un logiciel commercial complet type Questel ou PatSnap.

Comme je l'écris dans mon rapport : *une limite documentée vaut mieux qu'une illusion confortable*.

---

## Slide 19 — Perspectives · ~30 s

Les perspectives sont naturelles : industrialiser la passerelle OMPIC, activer les notifications email, enrichir le RAG avec des embeddings vectoriels, renforcer les tests E2E en intégration continue, et envisager une **mise en production encadrée** chez I2PA.

---

## Slide 20 — Conclusion · ~1 min

Pour conclure.

**PatentIQ** structure la préparation et le suivi d'un dossier de propriété intellectuelle pour un cabinet comme I2PA : collaboration multi-acteurs, antériorité assistée, surveillance OMPIC, cycles différenciés.

Le dépôt officiel reste sur **directompic.ma** — et c'est voulu.

Sur le plan personnel, ce stage m'a appris que **le métier impose l'architecture**. Écouter avant de coder. Corriger plutôt que masquer. Et livrer quelque chose d'honnête.

Je remercie l'équipe **I2PA**, mon encadrante **[nom]** pour ses retours qui ont orienté chaque itération, et mon tuteur **[nom]** pour son suivi académique.

---

## Slide 21 — Questions · ~30 s

Je vous remercie pour votre attention.

Je suis disponible pour vos **questions**.

Si vous le souhaitez, je peux également vous montrer une **démonstration live** de l'application — parcours marque ou brevet.

---

## Banque de réponses — questions fréquentes du jury

### « Pourquoi ne pas utiliser un logiciel existant (Questel, PatSnap…) ? »

> Ces solutions ciblent de grands cabinets, avec un coût et une complexité disproportionnés pour I2PA. PatentIQ vise un MVP sur mesure, centré OMPIC et Maroc, hébergeable à faible coût, avec des limites assumées.

### « L'IA remplace-t-elle le conseiller ? »

> Non. L'IA assiste : antériorité, synthèse, pré-examen heuristique. Chaque écran rappelle que le résultat est indicatif. La décision juridique reste humaine.

### « Comment gérez-vous l'absence d'API OMPIC ? »

> Recherche marques sur le portail public search.ompic.ma, avec modes live, proxy ou stub documentés. Brevets marocains via l'index EPO avec pn=MA. Pas de faux connecteur « API officielle ».

### « Qu'avez-vous appris personnellement ? »

> Traduire une règle métier PI en architecture logicielle. La remarque « marque ≠ brevet » a changé des semaines de développement. Et l'importance de tester avec deux rôles simultanément.

### « Le projet est-il déployé en production ? »

> Déployable sur Vercel + Supabase ; documentation dans WORKER_AND_DEPLOY.md. Usage pilote chez I2PA envisageable après validation encadrée.

---

## Timing récapitulatif

| Bloc | Slides | Durée |
|------|--------|-------|
| Intro + contexte | 1–4 | ~4 min |
| Objectifs + méthode + archi | 5–8 | ~5 min |
| 4 piliers + cycles | 9–13 | ~7 min |
| Avancé + sécu + tests + bilan | 14–18 | ~4 min |
| Fin | 19–21 | ~2 min |
| **Total slides** | | **~18 min** |
| Démo live (optionnelle) | | +5 min |
