# Signal V2 - Guide de deploiement

## Ce que contient ce dossier

```
signal-v2/
  server.js          -> Backend Node.js (RSS, API Anthropic securisee, base journalistes)
  package.json       -> Dependances Node
  .env.example       -> Variables d'environnement a configurer
  public/
    index.html       -> Frontend Signal (interface complete)
  data/              -> Cree automatiquement au premier lancement
    journalists.json -> Base journalistes editable
    clients.json     -> Fiches clients BBGCI, BOSS CI, MFP, L'Agence X
```

---

## Deploiement sur Render.com (gratuit, 15 minutes)

### Etape 1 - Creer un compte GitHub (si pas encore fait)
Va sur https://github.com et cree un compte gratuit.

### Etape 2 - Mettre le code sur GitHub
1. Cree un nouveau repository GitHub : clique sur "New repository"
2. Nomme-le "signal-pr"
3. Choisis "Private" (pour garder ton code confidentiel)
4. Uploade les fichiers : glisse le dossier signal-v2 ou utilise le bouton "uploading an existing file"
   Structure finale sur GitHub :
   - server.js
   - package.json
   - public/index.html
   (ne pas uploader .env.example ni le dossier data/)

### Etape 3 - Creer un compte Render.com
Va sur https://render.com et inscris-toi avec ton compte GitHub.

### Etape 4 - Creer le service
1. Clique sur "New +" puis "Web Service"
2. Connecte ton repository GitHub "signal-pr"
3. Configure ainsi :
   - Name : signal-pr
   - Region : Frankfurt (EU Central) - le plus proche d'Abidjan
   - Branch : main
   - Runtime : Node
   - Build Command : npm install
   - Start Command : node server.js
   - Instance Type : Free

### Etape 5 - Ajouter ta cle API Anthropic
Dans l'onglet "Environment" de ton service Render :
1. Clique "Add Environment Variable"
2. Key : ANTHROPIC_API_KEY
3. Value : ta cle API (disponible sur https://console.anthropic.com)

### Etape 6 - Deployer
Clique "Create Web Service".
Render installe les dependances et lance le serveur.
En 3-4 minutes, tu as une URL du type : https://signal-pr.onrender.com

C'est ton URL Signal V2. Tu peux la bookmarker, la partager ou y acceder depuis ton telephone.

---

## Ce qui fonctionne en V2

- Radar : flux RSS live depuis The Drum, Campaign, CB News, Influencia, Strategies, Adweek, Jeune Afrique, RFI, PRWeek, Les Echos. Actualise toutes les 5 minutes.
- Bottin journalistes : base editable en temps reel. Ajoute, modifie, supprime un contact. Persiste sur le serveur.
- Clients : fiches pre-chargees BBGCI, BOSS CI, MFP, L'Agence X avec axes de communication et mots-cles de veille.
- Veille : detection automatique des mentions clients dans les flux RSS selon les mots-cles des fiches clients.
- Pitch AI : genere un pitch email via Claude Sonnet, cle API securisee cote serveur (jamais exposee au navigateur).
- Assistant PR : chat IA briefé sur tes clients et marches, cle API securisee cote serveur.
- ROI : calculateur valorisation earned media.

---

## Note sur le plan gratuit Render

Le plan gratuit Render "spin down" le serveur apres 15 minutes d'inactivite. La premiere visite apres une periode d'inactivite peut prendre 30-50 secondes (le serveur se reveille). Pour eviter ca, passe au plan Starter (7 USD/mois) qui garde le serveur actif en permanence.

---

## Pour modifier la base journalistes ou clients

Les fichiers data/journalists.json et data/clients.json sont modifiables :
- Directement depuis l'interface Signal (bouton "Ajouter un journaliste" dans le Bottin)
- Ou en editant les fichiers JSON sur le serveur Render via le Shell

---

## Ta cle API Anthropic

Recupere-la sur https://console.anthropic.com/settings/api-keys
Elle ressemble a : sk-ant-api03-XXXXXXXXXX

Ne la partage jamais. Ne la mets jamais dans le code. Utilise toujours les variables d'environnement Render.
