# Audit des tests

Cas à vérifier  Test existant et assertion utile	Manque confirmé ou constat
Candidater avec un message	applications.test.ts:14 vérifie le statut 201, le message normalisé et IN_PROGRESS.	Couvert
Candidater sans message	applications.test.ts:28 vérifie message === null.	Couvert côté API
Refuser une offre non publiée et les doublons	applications.test.ts:38 vérifie les codes OFFER_NOT_PUBLISHED et APPLICATION_EXISTS.	Couvert
Retirer une candidature en cours	applications.test.ts:76 vérifie le retrait, la recandidature et les statuts conservés.	Couvert
Ne pas retirer la candidature d’un autre étudiant	applications.test.ts:104 vérifie le 404.	Couvert
Refuser le retrait d’une candidature traitée	applications.test.ts:112 vérifie APPLICATION_PROCESSED et le statut inchangé.	Couvert
Lister les candidatures de l’année courante	applications.test.ts:128 vérifie les candidatures de l’étudiant et exclut une autre année.	Couvert
Afficher les quatre statuts	ApplicationsPage.test.tsx:54 vérifie les libellés français.	Couvert
Afficher l’état vide	Nouveau test dans ApplicationsPage.test.tsx:68 : vérifie le message « Vous n’avez pas encore candidaté cette année », l’absence de tableau et l’absence de boutons.	Test P3 ajouté
Offre inexistante	Le service prévoit 404 NOT_FOUND, mais aucun test dédié.	Manque P2 confirmé
Message de 1000 caractères	Seul le rejet à 1001 caractères est testé.	Manque P2 confirmé
Ordre des candidatures	Le test trie les identifiants avant comparaison, donc ne vérifie pas l’ordre réel.	Manque P2 confirmé

# TDD

Les test initaux de recherche coté API, car l'API ignorait le paramètre 'search'.
On aurait pas pensé aux caractères comme % et / qui pourrait être interpreter littéralement.

# Recherche

Recherche sur un mot présent seulement dans la description doit renvoyer une liste vide.
Un déposant qui recherche 'de' ne doit voir que ses propres offres correspondants.
npm run check: tout les tests ajouté en TDD sont passé.

# Hooks

Non implémenté. (Optionel + pas de temps)
