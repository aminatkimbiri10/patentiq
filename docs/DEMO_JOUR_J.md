# Démo encadrante — fiche jour J (à garder sous les yeux)

**Durée cible : 15 min** · **URL :** http://localhost:3000

---

## AVANT (30 min avant) — 3 commandes

**Terminal 1**
```powershell
cd C:\Users\DELL\patent
npm run dev
```

**Terminal 2**
```powershell
cd C:\Users\DELL\patent
npm run ai:worker:loop
```

**Dans `.env.local`** — pour une démo sans blocage :
```env
OMPIC_SEARCH_MODE=hybrid
```
(`live` seul peut timeout ; `hybrid` = portail réel + secours si lent)

Ouvrir dans le navigateur (onglets prêts) :
1. http://localhost:3000/dashboard
2. http://localhost:3000/dashboard/surveillance
3. Projet **brevet** déjà créé
4. Projet **marque** déjà créé

---

## COMPTES

| Rôle | Email |
|------|-------|
| Porteur | `aminatkimbiri@gmail.com` |
| CPI | `kimbiriaminata16@gmail.com` |

Si « Email not confirmed » → Supabase : désactiver confirmation email, ou utiliser le lien reçu.

---

## SCRIPT ORAL — 15 MINUTES

### 0. Introduction (1 min)

> « PatentIQ aide I2PA à **préparer, suivre et surveiller** les dossiers PI au Maroc.  
> Ce n’est pas un remplacement de directompic : on **structure le dossier** avant le dépôt officiel OMPIC. »

---

### 1. Porteur — dossier brevet (4 min)

**Connexion porteur** → **Mes projets** → ouvrir le brevet

| Écran | Montrer | Phrase |
|-------|---------|--------|
| En-tête | statut, référence, KPI | « Vue d’ensemble du dossier » |
| **Dossier** | résumé invention, 1 PDF | « Tout est centralisé » |
| **Parcours PI → Cycle** | dépôt → 18 mois → publication | « Calendrier brevet ≠ marque » |
| **Parcours PI → Rédaction** | sections + *Suggérer brouillon IA* | « Contenu confidentiel, pas le fil de commentaires » |
| **Parcours PI → Revendications** | 1 indépendante + dépendantes | « Zone juridique séparée » |
| **Exporter dossier OMPIC** | bouton export | « Le CPI récupère un dossier structuré » |
| **Analyses IA** | une analyse **déjà terminée** (`completed`) | « Antériorité : EPO + brevets MA » |

⚠️ **Ne pas lancer une nouvelle analyse IA pendant la démo** — montrer l’historique déjà `completed`.

---

### 2. Surveillance marques (4 min)

**Menu Surveillance**

| Étape | Action | Phrase |
|-------|--------|--------|
| Bandeau | lire le mode OMPIC | « Interrogation du portail public search.ompic.ma » |
| **Portefeuille** | marque en watchlist | « Actifs protégés à surveiller » |
| **Scanner** | recherche `Coca` ou `TechMaroc` | « Données réelles OMPIC » |
| **Alertes** | traiter 1 alerte | « CPI choisit : suivi, opposition, ou faux positif » |

> « Fenêtre opposition marque : **~2 mois** après publication — pas 18 mois comme le brevet. »

**Plan B** : si scan vide → dire « mode hybrid, secours catalogue » et relancer, ou montrer alertes déjà en base.

---

### 3. CPI — pilotage (4 min)

**Déconnexion** → connexion **CPI** → **Dossiers**

| Action | Phrase |
|--------|--------|
| Ouvrir le brevet | « Vue conseil avec nom du porteur » |
| Changer statut → *Revue CPI* | « Workflow traçable » |
| **Échanges** → commentaire juridique | « Séparation échanges / contenu confidentiel » |
| Créer une **tâche** pour le porteur | « Le porteur voit l’action à faire » |
| Ouvrir projet **marque** → Cycle marque | « Statut Publié → rappel échéance opposition » |
| **Kanban** (optionnel) | « Pipeline de tous les dossiers » |

---

### 4. Sécurité + clôture (2 min)

**`/dashboard/security`** — email confirmé, 2FA TOTP

> « RLS Supabase : chaque utilisateur n’accède qu’à ses dossiers. »

**Menu Préparer dépôt OMPIC** — checklist + lien **directompic.ma**

> « PatentIQ prépare ; le dépôt officiel reste sur OMPIC. »

---

### 5. Conclusion (30 sec)

| Attente | Réponse PatentIQ |
|---------|------------------|
| Marque ≠ brevet | Cycles OMPIC distincts |
| Surveillance | Watchlist + scan OMPIC + alertes |
| Antériorité / FTO | IA + EPO + OMPIC MA |
| Confidentialité | Rédaction / revendications séparées |
| Sécurité | Auth, RLS, 2FA |

---

## QUESTIONS FRÉQUENTES — RÉPONSES COURTES

**« C’est connecté à l’OMPIC ? »**  
> Marques : oui, portail public search.ompic.ma. Brevets MA : index EPO. Pas d’API officielle ; pas de dépôt automatique.

**« Les données sont sécurisées ? »**  
> Supabase, RLS par projet, rôles porteur/CPI/expert, 2FA disponible.

**« L’IA remplace le CPI ? »**  
> Non. Brouillons et trames **indicatifs** — validation humaine obligatoire.

**« C’est déployé en ligne ? »**  
> Démo en local ; déploiement Vercel prévu (guides dans `docs/`).

---

## PLAN B RAPIDE

| Problème | Solution immédiate |
|----------|-------------------|
| IA `pending` | Terminal 2 : `npm run ai:worker:loop` |
| OMPIC lent / vide | `.env.local` → `OMPIC_SEARCH_MODE=hybrid` + redémarrer `npm run dev` |
| Erreur Parcours PI | `npm run db:push` |
| Connexion impossible | Vérifier email confirmé Supabase |
| Page blanche | Ctrl+F5, vérifier terminal 1 sans erreur |

---

## CHECKLIST 5 MIN AVANT

- [ ] Terminal 1 : `npm run dev` ✓
- [ ] Terminal 2 : `ai:worker:loop` ✓
- [ ] `OMPIC_SEARCH_MODE=hybrid`
- [ ] Mots de passe porteur + CPI OK
- [ ] Projet brevet + marque existants
- [ ] 1 analyse IA `completed` visible
- [ ] Test scan `Coca` fait une fois avant l’encadrante

---

*Guide complet : [DEMO_ENCADRANTE.md](./DEMO_ENCADRANTE.md)*
