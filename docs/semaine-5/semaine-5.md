Semaine 5

## Scénarios

Les deux parcours sont détaillés dans [scenarios.md](../e2e/recherche-offres/scenarios.md).

- **Scénario 1 — recherche avec résultat** : cas nominal, avec ` api ` pour vérifier
  l’ignorance de la casse et des espaces. Lucas doit voir uniquement l’offre publiée
  « API REST de facturation » de l’année en cours.
- **Scénario 2 — recherche sans résultat** : cas particulier, avec `intégrée`, terme
  présent dans la description mais absent des titres. Il vérifie que la recherche porte
  sur le titre et que l’interface affiche le message d’absence de résultat.

Les deux scénarios utilisent le compte étudiant de Lucas et les données seed documentées,
pour vérifier à la fois le filtrage par titre et la visibilité des offres.

## Playwright MCP

Le **scénario 1** a été tenté, mais n’a pas été exécuté jusqu’au bout. La trace confirme
la poignée de main MCP (HTTP 200, serveur Playwright 1.66.0-alpha), puis un seul appel
d’outil navigateur identifiable :

| Appel observé | Résultat renvoyé |
|---|---|
| `browser_navigate` vers `http://localhost:5173` | Échec au démarrage du navigateur : Chrome/Chromium absent à l’emplacement attendu. Aucun parcours dans l’interface n’a suivi. |

La trace ne contient pas de deuxième appel d’outil navigateur avec sa réponse : aucun
`browser_snapshot`, `browser_click` ou `browser_type` n’est attesté. La poignée de main
MCP est une opération de protocole, pas un deuxième appel d’outil. Le résultat du scénario
est donc **bloqué par l’installation du navigateur**, et non validé fonctionnellement.

## Playwright Test

Fichier de test : [recherche-offres.spec.ts](../e2e/recherche-offres/recherche-offres.spec.ts).
La configuration [playwright.config.ts](../playwright.config.ts) fournit la base URL et
démarre l’application avec `npm run dev`.

Les assertions vérifient :

- scénario 1 : une seule ligne de résultat, le titre exact, l’année `2026-2027`, le statut
  « Publiée » et le compte « 1 offre » ;
- scénario 2 : aucune table de résultats, le message exact d’absence de résultat et
  l’absence du titre « API REST de facturation ».

Deux exécutions successives sur Chromium ont réussi :

| Exécution | Commande | Résultat |
|---|---|---|
| 1 | `npx playwright test e2e/recherche-offres/recherche-offres.spec.ts --project=chromium` | 2 tests réussis (4,2 s), avec les serveurs et une base seed isolée démarrés pour l’exécution. |
| 2 | `npx playwright test e2e/recherche-offres/recherche-offres.spec.ts --project=chromium` | 2 tests réussis (9,5 s), avec le démarrage des serveurs assuré par Playwright. |

`npm run check` a réussi : lint et vérifications TypeScript réussis, **136 tests backend**
et **56 tests frontend** réussis, builds backend et frontend réussis.

## Vérification d’un défaut temporaire

Aucun défaut temporaire n’a été introduit dans l’application dans les traces disponibles ;
il n’y a donc pas d’échec provoqué par ce défaut ni de réussite après sa restauration à
rapporter. L’erreur `ERR_CONNECTION_REFUSED` signalée pendant l’exécution Playwright Test
venait de l’absence de serveur sur `localhost:5173`. Après configuration du `webServer`
Playwright pour lancer `npm run dev`, les deux tests ont réussi. Ce problème de démarrage
ne constituait pas un défaut applicatif injecté.

## Comparaison

1. Playwright MCP permet de piloter un navigateur de façon interactive. Le parcours testé (connexion de Lucas, recherche api) a été lancé par Playwright Test.

2. Les scripts Playwright Test rendent les vérifications répétables, versionnables et relançables, avec des assertions et un résultat de test exploitable, notamment en CI. Un compte rendu MCP décrit plutôt une exploration ponctuelle.

3. MCP explorer une interface inconnue ou diagnostiquer un parcours interactif. Un test automatisé pour vérifier régulièrement un comportement défini et éviter les régressions.