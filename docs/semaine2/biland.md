# Choix : quels sont les choix que vous avez pris lors de la plannification

Décisions métier confirmées

R: POST /applications accepte { offerId, message? } ; DELETE /applications/:id
retire la candidature.
R: Le retrait conserve la ligne en WITHDRAWN et une nouvelle candidature est
autorisée ensuite ; une seule candidature active est permise à la fois.
R: Le message est trimé, converti en NULL s'il est vide et limité à 1000 caractères.
R: GET /offers renverra l'état et l'identifiant de la candidature de l'étudiant
connecté afin d'afficher l'action dans la liste.
R: Une offre n'est candidate-able que lorsqu'elle est PUBLISHED, conformément à
RG-03.
R: La création répondra 201 avec la candidature ; le retrait répondra 204.
Q: Candidatures à afficher
R: Toutes les tentatives, y compris les candidatures retirées

# Résultat : ce qui fonctionne, ce qui n’a pas fonctionné, les difficultés et les limites restantes

tout functionne, difficulté: on ne connait pas l'utilisateur qui a candidature approuvé pour tester le traitement

# Modifications : les fichiers ajoutés ou modifiés et pourquoi ; les décisions prises après lecture du plan
tous les chouses concerne les candidatures, application, service, tests, navbar et un nouvelle page

# Validation fonctionnelle : les cas réellement essayés, les résultats observés et les corrections éventuelles

1. candidature à une offre publiée, avec et sans message ;
2. présence de la candidature et de son statut après rechargement ;
3. retrait d’une candidature encore en cours ;
4. impossibilité de retirer une candidature déjà traitée ;
5. séparation des candidatures de deux étudiants différents

# Qualité : les points vérifiés dans le code, les problèmes repérés et les simplifications effectuées, s’il y en a

le variable MAX_LENGTH est un peu hardcode quand il est utilisé juste 2 foix

# Tests et commandes : les tests ajoutés, les commandes exécutées et leurs résultats ; un exemple de comportement couvert par un test

1. Test pour crée une candidature avec ou sans message. Refus pour un offre non publié
2. Test de contrainte pour le basé de donneés. Refus des deux candidature pour la meme offre.
3. Test en frontend pour le candidature et navbar