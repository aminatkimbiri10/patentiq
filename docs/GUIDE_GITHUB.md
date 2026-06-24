# Guide — Héberger le code sur GitHub

Ce guide explique comment **publier PatentIQ sur GitHub** pour versionner le code et permettre le déploiement Vercel.

> **Ordre recommandé** : GitHub (ce guide) → [GUIDE_VERCEL.md](GUIDE_VERCEL.md) → Supabase ([DEPLOYMENT.md](DEPLOYMENT.md) §1)

---

## 1. Prérequis

| Élément | Vérification |
|---------|--------------|
| Compte GitHub | [github.com/signup](https://github.com/signup) |
| Git installé | `git --version` dans PowerShell |
| Projet local | dossier `patent` avec le code |

---

## 2. Créer le dépôt sur GitHub

1. Connectez-vous à [github.com](https://github.com)
2. Cliquez **+** (en haut à droite) → **New repository**
3. Renseignez :
   - **Repository name** : `patentiq` (ou `patent`)
   - **Description** : `Plateforme PI — PatentIQ (stage I2PA)`
   - **Public** ou **Private** (les deux fonctionnent avec Vercel)
   - **Ne cochez pas** « Add a README » si le projet existe déjà en local
4. Cliquez **Create repository**

GitHub affiche des commandes. Gardez l’URL du dépôt, par exemple :

```text
https://github.com/VOTRE_COMPTE/patentiq.git
```

> Votre dépôt existant : `https://github.com/aminatkimbiri10/patentiq.git`

---

## 3. Vérifier ce qui ne doit **jamais** partir sur GitHub

Le fichier `.gitignore` exclut déjà les secrets. **Ne commitez jamais** :

| Fichier | Pourquoi |
|---------|----------|
| `.env` | Clés secrètes |
| `.env.local` | Supabase, HF, EPO, workers |
| `.next/` | Build local |
| `node_modules/` | Dépendances (réinstallées sur Vercel) |

Vérifiez avant chaque push :

```powershell
cd C:\Users\DELL\patent
git status
```

Si `.env.local` apparaît, **ne l’ajoutez pas**. Il doit rester ignoré.

---

## 4. Premier envoi du code (dépôt vide sur GitHub)

Ouvrez **PowerShell** dans le dossier du projet :

```powershell
cd C:\Users\DELL\patent

# Initialiser git (si pas déjà fait)
git init

# Branche principale
git branch -M main

# Lier le dépôt distant
git remote add origin https://github.com/VOTRE_COMPTE/patentiq.git

# Tout ajouter (sauf fichiers ignorés)
git add .

# Premier commit
git commit -m "Initial commit — PatentIQ plateforme PI"

# Envoyer sur GitHub
git push -u origin main
```

GitHub vous demandera de vous **connecter** (navigateur ou token).

---

## 5. Dépôt déjà lié (votre cas)

Vous avez déjà `origin` → `aminatkimbiri10/patentiq` et les branches `main` / `develop`.

### 5.1 Voir l’état actuel

```powershell
cd C:\Users\DELL\patent
git remote -v
git branch
git status
```

### 5.2 Choisir la branche à déployer

| Branche | Usage |
|---------|--------|
| `main` | Production Vercel (recommandé) |
| `develop` | Intégration / tests avant merge |

Pour envoyer votre travail sur `main` :

```powershell
# Option A — vous êtes sur develop, tout merger dans main
git checkout main
git merge develop
git push origin main

# Option B — commit direct sur develop puis merge via GitHub
git checkout develop
git add .
git commit -m "feat: surveillance OMPIC, UI dashboard, docs déploiement"
git push origin develop
```

Puis sur GitHub : **Pull requests** → **New pull request** (`develop` → `main`) → **Merge**.

### 5.3 Commit classique (fichiers modifiés)

```powershell
cd C:\Users\DELL\patent

git add .
git status   # relire la liste — pas de .env.local

git commit -m "docs: guides GitHub et Vercel + config déploiement"

git push origin main
```

---

## 6. Authentification GitHub (Windows)

### Méthode A — GitHub CLI (simple)

```powershell
winget install GitHub.cli
gh auth login
```

Suivre les instructions (HTTPS, login navigateur).

### Méthode B — Personal Access Token (classique)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token** → cocher `repo`
3. Copier le token
4. Au `git push`, utilisateur = votre login GitHub, mot de passe = **le token**

Pour mémoriser les identifiants :

```powershell
git config --global credential.helper manager
```

---

## 7. Structure utile sur GitHub

Après le push, le dépôt doit contenir notamment :

```text
patentiq/
├── src/                 # code Next.js
├── supabase/migrations/ # schéma base de données
├── .github/workflows/   # workers IA + surveillance (cron)
├── docs/                # documentation
├── package.json
├── vercel.json          # config Vercel
└── .env.example         # modèle variables (sans secrets)
```

**Ne pas** pousser `.next/`, `node_modules/`, `test-results/`, fichiers temporaires Office (`~$*.pptx`).

Si besoin, ajoutez à `.gitignore` :

```gitignore
test-results/
docs/~$*
```

---

## 8. Secrets GitHub (pour les workers — après Vercel)

Une fois l’app déployée sur Vercel, configurez dans le repo GitHub :

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Valeur |
|--------|--------|
| `APP_URL` | `https://patentiq.vercel.app` |
| `AI_WORKER_SECRET` | même secret que sur Vercel |

Ces secrets alimentent `.github/workflows/ai-worker.yml` et `surveillance-scan.yml`.  
Détail : [GUIDE_VERCEL.md](GUIDE_VERCEL.md) §6.

---

## 9. Vérifications après push

Sur [github.com/aminatkimbiri10/patentiq](https://github.com/aminatkimbiri10/patentiq) :

- [ ] Le code source est visible (`src/`, `package.json`)
- [ ] `.env.local` **n’apparaît pas**
- [ ] La branche `main` est à jour
- [ ] L’onglet **Actions** est activé (workflows visibles)

---

## 10. Dépannage

| Problème | Solution |
|----------|----------|
| `remote origin already exists` | `git remote set-url origin https://github.com/.../patentiq.git` |
| `rejected (non-fast-forward)` | `git pull origin main` puis recommit |
| Fichier trop gros (> 100 Mo) | Retirer du commit ; vérifier `.gitignore` |
| Token refusé | Régénérer un PAT avec scope `repo` |
| `.env.local` commité par erreur | `git rm --cached .env.local` + commit + **révoquer les clés** Supabase |

---

## Étape suivante

Code sur GitHub → **[GUIDE_VERCEL.md](GUIDE_VERCEL.md)** pour déployer l’application en ligne.
