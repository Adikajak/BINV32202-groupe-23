User: Avec GitHub Copilot, explorez le dépôt et repérez les guides et senseurs présents. Un guide
donne à l’agent des consignes en amont ; un senseur observe le code ou son comportement et
produit un retour.
Classez les mécanismes dans cette matrice :
Guide — feedforward Senseur — feedback
Inférentiel (interprété par
une IA)
Ex. AGENTS.md Ex. revue de code par une IA
Computationnel (règles ou
calculs exécutables)
Ex. générateur de code Ex. tests, compilation, linter
Pour chaque mécanisme réellement présent :
— indiquez son nom et le fichier ou l’outil correspondant ;
1
— résumez ce qu’il demande, impose ou vérifie ;
— donnez un exemple concret de règle ou de résultat ;
— précisez s’il a été exécuté et vérifié pendant la séance, ou s’il est seulement décrit ou
configuré.


just tell me don't change the files

Copilot: Ran terminal command: git status --short; Get-ChildItem -Force | Select-Object Mode,Name

Find files matching `**/{AGENTS.md,.github/**,package.json,*.config.*,Makefile,*.yml,*.yaml,*.md}`

Search for `(lint|test|typecheck|build|generate|codegen|Copilot|instructions|review)`

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\package.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\.github\\copilot-instructions.md"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\README.md"
}

Find files matching `.github/**/*`

Find files matching `**/{AGENTS.md,.cursorrules,.windsurfrules,.pre-commit-config.yaml,eslint.conf...`

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\package.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\frontend\\package.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\.oxlintrc.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\frontend\\.oxlintrc.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\tsconfig.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\frontend\\tsconfig.app.json"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\.github\\pull_request_template.md"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\tests\\helpers\\requireSupportedNode.ts"
}

J’ai repéré les consignes Copilot, les contrôles configurés et les tests. Je lance maintenant la vérification globale documentée (`npm run check`) pour distinguer ce qui est seulement configuré de ce qui a réellement été exécuté.

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\vitest.config.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\tests\\nodeVersion.test.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\nodeVersion.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\frontend\\vite.config.ts"
}

Ran terminal command: npm run check

Ran terminal command: git status --short; node --version

Aucun fichier n’a été modifié. La vérification complète `npm run check` a réussi.

|  | **Guide — feedforward** | **Senseur — feedback** |
|---|---|---|
| **Inférentiel**<br>Interprété par une IA ou un humain | **Consignes Copilot** — `.github/copilot-instructions.md`. Elles orientent le travail : séparer validation HTTP, règles métier et SQL entre les couches ; vérifier les autorisations côté serveur ; utiliser `HttpError`. **Consultées pendant cette séance.**<br><br>**Contexte fonctionnel et technique** — `docs/cdc_gesta_developpement.md`, `docs/architecture.md` et `backend/API.md`. Références de conception et de contrat, signalées par les consignes Copilot ; **pas toutes consultées en détail pendant cette séance**.<br><br>**Modèle de PR** — `.github/pull_request_template.md` : demande notamment des tests, la vérification des droits backend et la mise à jour de la documentation API. **Configuré, non utilisé** : aucune PR n’a été préparée. | **Aucun senseur de revue IA distinct repéré ou exécuté.** Cette exploration Copilot n’était pas une revue automatisée de changements. |
| **Computationnel**<br>Règles ou calculs exécutables | **Aucun générateur de code identifié.** Le build copie les migrations vers la sortie compilée, mais ce n’est pas un générateur de code. | **Oxlint** — configs `backend` et `frontend` : impose par exemple `eqeqeq` et interdit `any` explicite. **Exécuté : réussi sans avertissement** via `npm run check`.<br><br>**TypeScript** — `config backend` et `config frontend` : vérifie notamment les types stricts et les accès potentiellement indéfinis. **Exécuté : réussi.**<br><br>**Vitest** — tests backend et frontend : vérifient les comportements, par exemple les versions de Node acceptées ou refusées dans `nodeVersion.test.ts`. **Exécuté : 18 fichiers et 176 tests réussis** (123 backend, 53 frontend).<br><br>**Build** — scripts dans le `package.json racine` : compilation TypeScript et build Vite de production. **Exécuté : réussi.**<br><br>**Contrôle de version Node** — `backend/src/nodeVersion.ts` et `requireSupportedNode.ts` : refuse une version trop ancienne ; l’exécution a utilisé Node `v24.22.0` et les tests associés ont passé. |

Je n’ai trouvé ni `AGENTS.md` ni workflow GitHub Actions dans le dépôt. Le dossier non suivi `docs/semaine3/` était déjà présent et est resté intact.

User: Construisez une matrice de traçabilité entre les exigences travaillées la séance précédente et les
tests qui les vérifient réellement.
Partir des exigences
Relisez le cahier des charges, en particulier EF-32 (candidater et retirer sa candidature) et
EF-33 (consulter ses candidatures et leur statut). Découpez-les en cas précis, avec le résultat
attendu : cas normaux, refus et limites. Par exemple, une offre non publiée ne doit pas accepter
de candidature et un étudiant ne doit pas voir les candidatures d’un autre.
Relier les tests aux cas
Explorez les tests existants, notamment les tests d’API s’il y en a. Pour chaque cas, relevez le
fichier, le nom du test et les assertions qui vérifient le résultat attendu.
Exigence Cas à vérifier
Test existant
(fichier et nom) Assertions utiles Couverture
EF-32 Refuser une
candidature à
une offre non
publiée
… … Couvert /
Partiel / Absent
EF-33 Un étudiant ne
voit que ses
candidatures
… … Couvert /
Partiel / Absent
Un cas est couvert seulement si les assertions portent effectivement sur son résultat attendu.
Un test qui appelle une route et reçoit une réponse ne suffit pas nécessairement. Notez aussi les
comportements testés qui ne correspondent pas à EF-32 ou EF-33, sans les rattacher à une
exigence au hasard.
2
Traiter les manques
Repérez les cas absents ou partiellement couverts. Choisissez les manques les plus importants
et ajoutez ou améliorez des tests avec les outils déjà utilisés dans le projet. Privilégiez les
vérifications possibles au niveau de l’API et du backend. Il n’est pas demandé de créer des
tests end-to-end ni de refaire toute la suite. Si un cas ne peut pas être vérifié avec les tests
disponibles, signalez cette limite et indiquez comment vous l’avez vérifié manuellement, le cas
échéant.
Lancez npm run check après vos modifications et relevez le résultat de chaque contrôle. Pour
un test ajouté, expliquez quel défaut le ferait échouer ; vérifiez ce point seulement si vous pouvez
le faire sans risque pour le projet.

Copilot: Search for `EF-32|EF-33`

Search for `describe\(|it\(|test\(`

Ran terminal command: git status --short; Get-Content backend\tests\applications.test.ts; Get-Content backend\tests\offers.test.ts

Find files matching `backend/src/**/*application*`

Find files matching `backend/src/http/**/*`

Read , lines 1 to 220
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\tests\\applications.test.ts",
  "view_range": [
    1,
    220
  ]
}

Read , lines 1 to 160
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\tests\\offers.test.ts",
  "view_range": [
    1,
    160
  ]
}

Search for `applications|candidature|Candidature|application`

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\services\\applications.service.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\controllers\\applications.controller.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\repositories\\applications.repository.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\db\\migrations\\002_applications_one_active.sql"
}

Read , lines 1 to 220
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\db\\seed\\seed.ts",
  "view_range": [
    1,
    220
  ]
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\models\\application.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\tests\\helpers\\testApp.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\db\\seed\\offersData.ts"
}

Read 
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\db\\seed\\seedIds.ts"
}

Read , lines 75 to 180
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\backend\\src\\db\\migrations\\001_initial.sql",
  "view_range": [
    75,
    180
  ]
}

Search for `applications|candidature|withdraw|APPLICATION_PROCESSED`

Search for `export const applications|id: [1-6],|status: "(SELECTED|REJECTED|IN_PROGRESS|...`

Les tests actuels couvrent déjà la candidature normale, le retrait, la liste limitée à l’année courante et les statuts, mais le refus de retirer une candidature déjà traitée n’est pas testé. Je vais ajouter ce cas critique et rendre explicite l’isolation de la liste par étudiant, sans toucher aux fichiers de documentation ni aux modifications préexistantes.

Edit 

Ran terminal command: npm run check

Search for `it\(|expect\(`

Ran terminal command: git diff -- backend\tests\applications.test.ts; git status --short

Search for `IN_PROGRESS|WITHDRAWN|SELECTED|REJECTED|En cours|Retirée|Retenue|Non retenue`

Read , lines 1 to 110
Completed with input: {
  "path": "C:\\Users\\adika\\Documents\\Davinci_3year\\ai_pour_dev\\Projet\\BINV32202-groupe-23\\frontend\\tests\\ApplicationsPage.test.tsx",
  "view_range": [
    1,
    110
  ]
}

J’ai consulté EF-32 et EF-33 dans le `cahier des charges`. Les tests API cités sont dans `backend/tests/applications.test.ts` ; les tests d’affichage dans `frontend/tests/ApplicationsPage.test.tsx`.

### Matrice de traçabilité

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

### Autres comportements testés

Le test `renvoie l&#39;état de la candidature uniquement à l&#39;étudiant` porte sur le champ de candidature renvoyé par `GET /offers`, et non sur la liste `GET /applications` d’EF-33. Le test d’interface `retire une candidature en cours puis actualise son statut` complète les tests API en vérifiant l’actualisation affichée après retrait.

### Modification et vérifications

J’ai renforcé les assertions pour vérifier les codes d’erreur de l’offre non publiée et du doublon, rendu explicite l’isolement de la liste par étudiant, et ajouté le test de refus de retrait après traitement. Ce dernier échouerait si l’API acceptait le retrait d’une candidature retenue ou non retenue, ou si son statut était modifié malgré le refus. Je n’ai pas provoqué volontairement ces défauts dans le code de production.

`npm run check` a réussi : lint backend et frontend, vérifications TypeScript, **125 tests backend et 53 frontend réussis**, builds backend et frontend réussis.