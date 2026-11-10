
### 1. Repérer les guides et les senseurs (Inventaire)

|  | **Guide — feedforward** | **Senseur — feedback** |
|---|---|---|
| **Inférentiel**<br>Interprété par une IA ou un humain | **Consignes Copilot** — `.github/copilot-instructions.md`. Elles orientent le travail : séparer validation HTTP, règles métier et SQL entre les couches ; vérifier les autorisations côté serveur ; utiliser `HttpError`. **Consultées pendant cette séance.**<br><br>**Contexte fonctionnel et technique** — `docs/cdc_gesta_developpement.md`, `docs/architecture.md` et `backend/API.md`. Références de conception et de contrat, signalées par les consignes Copilot ; **pas toutes consultées en détail pendant cette séance**.<br><br>**Modèle de PR** — `.github/pull_request_template.md` : demande notamment des tests, la vérification des droits backend et la mise à jour de la documentation API. **Configuré, non utilisé** : aucune PR n’a été préparée. | **Aucun senseur de revue IA distinct repéré ou exécuté.** Cette exploration Copilot n’était pas une revue automatisée de changements. |
| **Computationnel**<br>Règles ou calculs exécutables | **Aucun générateur de code identifié.** Le build copie les migrations vers la sortie compilée, mais ce n’est pas un générateur de code. | **Oxlint** — configs `backend` et `frontend` : impose par exemple `eqeqeq` et interdit `any` explicite. **Exécuté : réussi sans avertissement** via `npm run check`.<br><br>**TypeScript** — `config backend` et `config frontend` : vérifie notamment les types stricts et les accès potentiellement indéfinis. **Exécuté : réussi.**<br><br>**Vitest** — tests backend et frontend : vérifient les comportements, par exemple les versions de Node acceptées ou refusées dans `nodeVersion.test.ts`. **Exécuté : 18 fichiers et 176 tests réussis** (123 backend, 53 frontend).<br><br>**Build** — scripts dans le `package.json racine` : compilation TypeScript et build Vite de production. **Exécuté : réussi.**<br><br>**Contrôle de version Node** — `backend/src/nodeVersion.ts` et `requireSupportedNode.ts` : refuse une version trop ancienne ; l’exécution a utilisé Node `v24.22.0` et les tests associés ont passé. |


### 2. Première partie — Examiner les senseurs : couverture des tests (couverture des exigences + modification et vérifications)
 
| Exigence | Cas à vérifier et résultat attendu | Test existant (fichier et nom) | Assertions utiles | Couverture |
|---|---|---|---|---|
| EF-32 | Candidater à une offre publiée avec un message : création et statut `IN_PROGRESS` | `crée une candidature étudiante avec un message normalisé` | `201`, offre, message normalisé et statut vérifiés | **Couvert** |
| EF-32 | Candidater sans message : candidature acceptée, message nul | `accepte une candidature sans message` | `201` et `message === null` | **Couvert** |
| EF-32 | Offre non publiée : candidature refusée | `refuse une offre non publiée et les doublons en cours` | `409` et code `OFFER_NOT_PUBLISHED` | **Couvert** |
| EF-32 | Candidature déjà en cours pour la même offre : doublon refusé | Même test | `409` et code `APPLICATION_EXISTS` | **Couvert** |
| EF-32 | Message trop long : requête refusée | `refuse un message trop long et les contacts` | Un message de 1001 caractères obtient `400` | **Partiel** — la limite haute est testée, pas la valeur exacte de 1000 caractères |
| EF-32 | Retirer une candidature en cours : retrait conservé et nouvelle candidature possible | `retire une candidature en cours et permet de recandidater` | `204`, nouvelle candidature `201` avec nouvel ID, liste contenant `IN_PROGRESS` et `WITHDRAWN` | **Couvert** |
| EF-32 | Retirer la candidature d’un autre étudiant : refus | `n&#39;autorise pas le retrait d&#39;une candidature d&#39;un autre étudiant` | `404` | **Couvert** |
| EF-32 | Retirer une candidature déjà traitée : refus et statut inchangé | `refuse de retirer une candidature déjà traitée` — **ajouté pendant cette séance**, pour les statuts retenu et non retenu | `409`, code `APPLICATION_PROCESSED`, puis lecture vérifiant que le statut n’a pas changé | **Couvert** |
| EF-32 | Offre inexistante : candidature refusée | Aucun test trouvé | — | **Absent** |
| EF-33 | Voir ses candidatures de l’année en cours, sans celles d’autres étudiants | `liste toutes les tentatives de l&#39;étudiant pour l&#39;année courante` | Vérifie exactement les IDs `[2, 5]` de l’étudiante et les données de ses candidatures | **Couvert** |
| EF-33 | Exclure les candidatures d’une autre année académique | `ne renvoie pas les candidatures d&#39;une autre année` | Insère une candidature d’archive puis vérifie que seuls les IDs `[2, 5]` sont renvoyés | **Couvert** |
| EF-33 | Consulter les statuts retenu et non retenu | `expose les candidatures retenues et non retenues` | La liste contient `SELECTED` et `REJECTED` | **Couvert** |
| EF-33 | Afficher les quatre statuts sous leur libellé français | `affiche toutes les tentatives et traduit les quatre statuts` | Vérifie « En cours », « Retenue », « Non retenue » et « Retirée » | **Couvert** |
| EF-33 | Réserver la liste aux étudiants | `refuse l&#39;accès aux profils autres qu&#39;étudiant` | Admin et contact obtiennent `403` | **Couvert** |

### 3. Deuxième partie — Auditer les guides à la lumière de Web 2 (audit de guides)

## 1. Introduction et Périmètre de l'Audit

Cet audit analyse les consignes fournies aux agents virtuels d'assistance au développement dans le dépôt du projet (fichier `copilot-instructions.md`) et les compare aux concepts, conventions et exigences enseignés dans le cadre du cours Web 2 (séances 01 à 14) [4, 6, 7].

L'objectif de cet audit est d'évaluer dans quelle mesure les instructions destinées à l'agent (Copilot) orientent correctement la production de code avant que des tests ou des revues de code n'interviennent, de repérer les éventuelles divergences ou omissions, et de proposer des améliorations concrètes et motivées pour enrichir les guides du projet [1, 2, 3].

---

## 2. Synthèse par Domaine Technique

### 2.1. Architecture et Structuration du Code
* **Enseignement Web 2 :** Séparation stricte entre le serveur backend et le client frontend [62]. En React, organisation initiale préconisée par dossiers : `models/` (interfaces TypeScript), `data/` (données de démonstration ou constantes) et `components/` (composants d'affichage) [130].
* **Consignes du Guide (`copilot-instructions.md`) :** Formalisation sous forme d'un monorepo `npm-workspaces` comprenant `backend/` (Express/TypeScript/SQLite) et `frontend/` (React/TypeScript/Vite) [2].
  * Côté **backend**, découpage strict par responsabilités : `controllers` (parsing et validation HTTP), `services` (règles métier), `repositories` (requêtes SQL) et `mappers` (conversions DTO/domain) [2].
  * Côté **frontend**, architecture hiérarchique : `pages -> hooks -> services/utils -> models`, les composants réutilisables d'affichage se plaçant sous `pages` [2].
* **Constat :** **Correspondance forte**. Le guide formalise et professionnalise la structuration globale tout en restant totalement fidèle aux principes d'architecture enseignés [2, 130].

### 2.2. API REST, Traitement des Erreurs et Documentation
* **Enseignement Web 2 :** Respect des conventions REST pour les verbes (GET, POST, PUT, PATCH, DELETE) [21], utilisation appropriée des codes de statut HTTP (200, 201, 204, 400, 401, 403, 404, 409, 500) [23], et documentation systématique du contrat d'interface dans un fichier `API.md` [29, 32].
* **Consignes du Guide (`copilot-instructions.md`) :** Injonction formelle de lire et de mettre à jour `backend/API.md` ainsi que les fichiers d'exemples sous `backend/http/` lors de toute modification ou création d'endpoint [2, 3]. Gestion des erreurs imposée via la levée d'exceptions `HttpError` traitées par un middleware centralisé renvoyant un schéma normalisé `{ "error": { "code", "message" } }` [2].
* **Constat :** **Correspondance forte**. Les consignes du guide renforcent la discipline de documentation et la centralisation de la gestion des erreurs [2, 29].

### 2.3. Authentification, Sécurité et Gestion des Tokens (JWT & Bcrypt)
* **Enseignement Web 2 :** 
  * Envoi du token JWT dans l'en-tête HTTP `Authorization` [37, 44].
  * Hachage obligatoire et asynchrone des mots de passe avec `bcrypt` et du sel (*salt*), interdisant tout stockage en clair dans la base de données [46, 49, 51].
  * Clé secrète JWT configurée via des variables d'environnement (`process.env.JWT_SECRET`) hors de Git [39].
* **Consignes du Guide (`copilot-instructions.md`) :** Exige explicitement que l'en-tête `Authorization` contienne le JWT **directement, sans le préfixe `Bearer`** [3], ce qui correspond exactement aux exemples de requêtes fournis dans le cours Web 2 [37, 44]. Le guide impose en outre que l'authentification réinterroge l'utilisateur et ses rôles en base de données à chaque requête et rappelle que les masquages d'interface au frontend ne remplacent jamais l'autorisation backend [3].
* **Constat :** **Correspondance partielle**. La règle sur le JWT sans `Bearer` et la primauté de l'autorisation backend sont parfaitement alignées [3, 41]. Cependant, les consignes de hachage des mots de passe par `bcrypt` avant stockage en BDD ne sont pas explicitées dans le guide.

### 2.4. React, Gestion de l'État et Immuabilité
* **Enseignement Web 2 :** Immuabilité stricte des props et du state [104, 173], utilisation du hook `useState` [142], formulaires contrôlés (`value`/`onChange`) [159], propagation unidirectionnelle des données et remontée d'état (*lifting state up*) [185, 186]. Mises à jour des tableaux d'état uniquement via des fonctions pures/superficielles (`filter`, `map`, spread operator `...`) [174, 175].
* **Consignes du Guide (`copilot-instructions.md`) :** Définit `App.tsx` comme le composant unique propriétaire du hook `useAuth`, chargé de passer le token et le callback de déconnexion aux pages [2]. Exige la validation des réponses API au frontend par des type guards via la fonction helper `readJson` [3].
* **Constat :** **Correspondance partielle**. L'organisation haut niveau du state (ex: `useAuth` dans `App.tsx`) est bien définie [2], mais les consignes de non-mutation du state React ne sont pas rappelées à l'agent.

### 2.5. Accessibilité (a11y) et Ergonomie Frontend
* **Enseignement Web 2 :** Utilisation de la bibliothèque Material UI (MUI) [118], structuration du thème global via `ThemeProvider` et `CssBaseline` [120], et intégration des règles d'accessibilité (attributs `aria-label` pour les boutons d'action sans texte, gestion du focus, validation visuelle de formulaires) [150, 162, 166].
* **Consignes du Guide (`copilot-instructions.md`) :** Mentionne l'utilisation de helpers de traduction pour afficher en français les codes d'enums stockés en anglais [3].
* **Constat :** **Absente / Partielle**. Aucune directive explicite concernant l'accessibilité web (normes WCAG, attributs ARIA, lisibilité par lecteur d'écran) ne figure dans le guide de l'agent.

---

## 3. Tableau d'Audit Comparatif

| Attente ou convention de Web 2 (source) | Guide examiné (fichier et passage) | Correspondance | Écart ou ajout proposé |
| :--- | :--- | :--- | :--- |
| **Architecture Monorepo & Découpage en couches** (Séance 01 [4], Séance 07 [86], Séance 10 [130]) | `copilot-instructions.md` (Passage [2]) | **Oui** | Conforme et enrichi : formalise la séparation `backend/` et `frontend/`, la structure backend en couches (controllers, services, repositories, mappers) et la hiérarchie frontend `pages/hooks/services/models`. |
| **Documentation API REST (`API.md`) et Codes HTTP** (Séance 02 [23, 29]) | `copilot-instructions.md` (Passages [2, 3]) | **Oui** | Conforme : impose la mise à jour systématique de `backend/API.md` et des fichiers `.http` de test pour chaque modification d'endpoint. |
| **Format du Token JWT dans `Authorization`** (Séance 03 [37, 44]) | `copilot-instructions.md` (Passage [3]) | **Oui** | Conforme : spécifie explicitement que l'en-tête `Authorization` contient le JWT directement sans préfixe `Bearer`. |
| **Primauté de l'Autorisation Backend** (Séance 03 [41], Séance 14 [185]) | `copilot-instructions.md` (Passage [3]) | **Oui** | Conforme : rappelle fermement que la visibilité frontend ne remplace jamais le contrôle d'accès en base de données. |
| **Validation des DTO et Réponses JSON via Type Guards** (Séance 01 [15], Séance 12 [166]) | `copilot-instructions.md` (Passages [2, 3]) | **Oui** | Conforme : validation HTTP dans les contrôleurs backend et validation des réponses d'API frontend avec des type guards via `readJson`. |
| **Hachage Asynchrone des Mots de Passe via Bcrypt** (Séance 04 [46, 49, 55]) | `copilot-instructions.md` (Non mentionné explicitement) | **Partielle** | Écart : le guide ne rappelle pas l'obligation d'utiliser `bcrypt` avec sel (*salt*) avant la sauvegarde en base de données. *Ajout recommandé.* |
| **Immuabilité du State React & Formulaires Contrôlés** (Séance 11 [142], Séance 12 [159], Séance 13 [173]) | `copilot-instructions.md` (Passage [2]) | **Partielle** | Écart : la gestion globale du rôle (`useAuth` dans `App.tsx`) est spécifiée, mais pas l'interdiction de modifier directement les tableaux ou objets d'état React. *Ajout recommandé.* |
| **Accessibilité Web & Attributs ARIA** (Séance 09 [118], Séance 11 [150]) | `copilot-instructions.md` (Passage [3]) | **Absente** | Écart : aucune consigne ne sensibilise l'agent aux normes d'accessibilité (ex: `aria-label` sur boutons d'icônes). *Ajout recommandé.* |
| **Dispositif de Tests Automatisés** (Séance 02 [25], Séance 03 [44]) | `copilot-instructions.md` (Passages [1, 3]) | **Oui** (Dépassement) | Supérieur aux attentes : là où Web 2 utilise des tests manuels REST Client, le guide impose `Vitest` + `Supertest` (backend SQLite in-memory) et `Vitest` + `Testing Library` (frontend). |

---

## 4. Recommandations Justifiées pour Enrichir le Guide `copilot-instructions.md`

À la lumière de cet audit, voici trois recommandations d'ajouts ciblés à intégrer dans `copilot-instructions.md` pour garantir une parfaite conformité avec les enseignements de Web 2 :

1. **Préciser les exigences de Hachage des Mots de Passe (Sécurité Backend) :**
   * *Motivation :* Pour éviter que l'agent génère du code de création d'utilisateur stockant des mots de passe en clair ou faiblement encodés [46], ajouter sous la rubrique *Repository-specific conventions* :
   * *Proposition de consigne :* `"User passwords must never be stored in plain text. Always hash them asynchronously using bcrypt with a salt factor of at least 10 during registration."` [49, 55]

2. **Ajouter une consigne d'Accessibilité Frontend (Ergonomie & a11y) :**
   * *Motivation :* Les composants d'icônes (notamment les boutons d'action d'icône MUI ou JSX) doivent être lisibles par les technologies d'assistance [150].
   * *Proposition de consigne :* `"Ensure interactive UI elements, especially icon-only buttons, include proper accessibility labels (e.g., aria-label) for screen readers."` [150]

3. **Rappeler le principe d'Immuabilité de l'État React :**
   * *Motivation :* Les modèles d'IA commettent parfois des erreurs en appliquant des mutations directes (`push`, `splice`, modification directe de propriété) sur des variables d'état [173, 176].
   * *Proposition de consigne :* `"Treat React state as immutable. Always use pure update patterns (spread operator, map, filter) or functional state updates when updating arrays or objects."` [174, 175]
