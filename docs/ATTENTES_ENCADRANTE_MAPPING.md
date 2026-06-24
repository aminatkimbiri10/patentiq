# Attentes encadrante → PatentIQ

Document de **correspondance** entre les propos de la réunion de suivi et les écrans PatentIQ.  
À imprimer ou projeter pendant la démo (1 page par pilier).

---

## Message central

> « Les systèmes sont différents par rapport aux produits. »

| Produit PI | Calendrier OMPIC | Où dans PatentIQ |
|------------|------------------|------------------|
| **Marque** | Publication ~2 mois → opposition → enregistrement ~4 mois | Dossier → **Parcours PI → Cycle marque** |
| **Brevet** | Confidentialité → dépôt → publication ~18 mois | Dossier → **Parcours PI → Cycle brevet** + Rédaction / Revendications |
| **Dessin & modèle** | Antériorité visuelle, surveillance apparence | Parcours PI + **Surveillance → Dessins & modèles** |

---

## Pilier B — Surveillance catalogue OMPIC

| Attente encadrante | Écran PatentIQ | Chemin menu |
|--------------------|----------------|-------------|
| Surveiller les marques **déjà enregistrées** du client | Portefeuille watchlist | **Surveillance → Portefeuille** |
| Détecter marques **similaires** dans le catalogue OMPIC | Scanner OMPIC + alertes | **Surveillance → Scanner** puis **Alertes** |
| Informer le client / lancer **opposition** | Statuts alerte + fiche opposition | **Alertes** : Vu / Opposition lancée / Faux positif |
| Stockage actifs (nom, classes, résumé) | Fiche actif watchlist | **Surveillance → Ajouter un actif** |
| Veille technologique continue | Veille IPC / mots-clés | **Surveillance → Veille** |

**À dire :** « PatentIQ interroge search.ompic.ma en direct ; en mode `hybrid`, un catalogue de secours évite un écran vide si le portail est en maintenance. »

---

## Pilier A — Rédaction & revendications (brevet)

| Attente encadrante | Écran PatentIQ | Chemin |
|--------------------|----------------|--------|
| Partie **confidentielle** avant dépôt | Revendications séparées des échanges | Dossier → **Parcours PI → Revendications** |
| Description selon critères OMPIC | 5 sections rédaction | Parcours PI → **Rédaction** |
| Aide IA (validation CPI) | Suggérer brouillon (IA) | Bouton dans Rédaction |
| Livrable CPI | Export HTML/PDF + **Export ZIP dossier** | Boutons en haut du Parcours PI brevet |

---

## Pilier C — Workflows marque ≠ brevet

| Attente | Marque | Brevet |
|---------|--------|--------|
| Jalons OMPIC | Déposé → Publié (2 mois) → Enregistré → Surveillance | Brouillon → Dépôt → Examen → Publié (18 mois) → Veille |
| Écran | Parcours PI → Cycle marque | Parcours PI → Cycle brevet |
| Rappel échéance | Widget accueil (opposition) | Widget accueil (publication) |

---

## Transverse — OMPIC & dépôt officiel

| Attente | Réponse PatentIQ |
|---------|------------------|
| Recherche base **marocaine** | OMPIC live (marques) + brevets MA via EPO (`pa=MA`) |
| Comprendre **directompic.ma** | Page **Préparer dépôt OMPIC** (checklists + lien portail) |
| PatentIQ ≠ dépôt officiel | Préparation dossier ici ; dépôt sur directompic.ma |

**Liens menu :** Surveillance · Préparer dépôt OMPIC (porteur et CPI)

---

## Transverse — Sécurité

| Attente | PatentIQ |
|---------|----------|
| Email valide confirmé | Auth Supabase + middleware |
| Code sécurité / 2FA | **Profil → Sécurité** (TOTP) |
| Isolation des dossiers | RLS Supabase par projet et rôle |

---

## Pilier D — Valorisation / commercialisation

| Statut | Détail |
|--------|--------|
| **Retiré** (migration `00032`) | Module commercialisation supprimé de l'app |
| **Redirection** | Ancien lien `?tab=valorisation` → Parcours PI |

Ne pas promettre une fiche valorisation en démo — mentionner comme évolution post-stage si demandé.

---

## Synthèse orale (30 secondes)

> « Quand I2PA dépose une marque, PatentIQ la met en surveillance OMPIC, alerte en cas de similarité pendant les 2 mois d'opposition, et le CPI suit la procédure dans la fiche alerte. Pour le brevet, rédaction et revendications sont séparées des échanges, avec antériorité EPO + OMPIC Maroc. Le dépôt officiel reste sur directompic ; PatentIQ prépare le dossier et l'export ZIP pour le CPI. »

---

## Ressources

| Document | Usage |
|----------|--------|
| [DEMO_PREP_PRIORITE1.md](./DEMO_PREP_PRIORITE1.md) | Checklist technique avant démo |
| [DEMO_ENCADRANTE.md](./DEMO_ENCADRANTE.md) | Script 18 min |
| [ROADMAP_ATTENTES_ENCADRANTE.md](./ROADMAP_ATTENTES_ENCADRANTE.md) | Roadmap complète |

*I2PA — PatentIQ — 2026*
