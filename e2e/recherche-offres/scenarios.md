# Scénarios E2E — Recherche d'offres

Ces scénarios vérifient la recherche d'offres par titre (EF-30) depuis
l'interface utilisateur. Ils utilisent les données de démonstration décrites dans
[`docs/seed.md`](../../docs/seed.md).

## Règles vérifiées

- La recherche porte uniquement sur le titre de l'offre.
- Elle ne distingue pas les majuscules et les minuscules.
- Les espaces au début et à la fin de la saisie sont ignorés.
- Un étudiant ne voit que les offres publiées de l'année académique en cours.
- Une recherche sans correspondance affiche une liste vide et un message explicite.

## État initial commun

- La base de données est initialisée avec les données de démonstration.
- L'année académique courante est `2026-2027`.
- L'utilisateur est connecté avec le compte étudiant **Lucas Dupont**.
- La page **Offres de stage** est ouverte.
- Aucun filtre de période n'est sélectionné.
- Les offres publiées visibles par Lucas comprennent notamment :
  - **Application React de gestion de flotte** (Lumen Digital, P2) ;
  - **API REST de facturation** (Orbis, P2) ;
  - **Tableau de bord de qualité des données** (Lumen Data, P2) ;
  - **Assistant conversationnel interne** (Nexalis, P2).
- Les offres non publiées, comme **Refonte du portail client** (soumise), ne
  doivent pas être visibles pour cet étudiant.

## Scénario 1 — Recherche avec résultat

| Élément | Description |
|---|---|
| **Numéro** | 1 |
| **Scénario** | Recherche nominale d'une offre par un mot présent dans son titre |
| **État initial** | L'état initial commun est en place. Le champ **Mot-clé** est vide et aucune période n'est sélectionnée. |
| **Actions dans l'interface** | 1. Cliquer dans le champ **Mot-clé**.<br>2. Saisir ` api `, avec une minuscule et des espaces avant et après le terme.<br>3. Attendre la mise à jour des résultats. |
| **Résultat attendu** | Une seule offre est affichée : **API REST de facturation**. Le titre est visible dans la liste et l'offre reste consultable par Lucas parce qu'elle est publiée et appartient à l'année courante. Les offres dont le titre ne contient pas `api` ne sont pas affichées. |

## Scénario 2 — Recherche sans résultat dans le titre

| Élément | Description |
|---|---|
| **Numéro** | 2 |
| **Scénario** | Recherche d'un terme présent dans une description mais absent de tous les titres |
| **État initial** | Repartir de l'état initial commun. Le champ **Mot-clé** est vide et aucune période n'est sélectionnée. Dans les données seed, `intégrée` apparaît dans la description de **API REST de facturation**, mais pas dans son titre ni dans celui d'une autre offre publiée. |
| **Actions dans l'interface** | 1. Cliquer dans le champ **Mot-clé**.<br>2. Saisir `intégrée`.<br>3. Attendre la mise à jour des résultats. |
| **Résultat attendu** | Aucune offre n'est affichée dans la liste. Le message **« Aucune offre ne correspond à votre recherche. »** est visible. L'offre **API REST de facturation** n'apparaît pas, car la recherche ne porte pas sur la description. |

