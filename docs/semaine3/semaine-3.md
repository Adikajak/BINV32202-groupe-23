
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

---

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
