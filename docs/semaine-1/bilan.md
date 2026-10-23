# Qu’ai-je appris ? Une notion, une méthode de travail, une découverte sur le fonctionnement de l’agent…
On a découvert une fonctionne de l'agent, la commande "/init" qui fait explorer le dépôt par l'agent (README, package.json, architecture, API, tests), puis génère un fichier .github/copilot-instructions.md

# Qu’est-ce qui a bien fonctionné ? Une demande efficace, une bonne utilisation de l’agent, un contrôle qualité pertinent…
Les URL qui sont bien cadré ex: "GET /offers?period=P1", liste exacte des options et contraintes explicites. L'agent n'a eu aucune ambiguïté à lever et n’a posé aucune question inutile.

# Qu’est-ce qui a moins bien fonctionné 
Une modification multi-fichiers a planté, car l’agent supposait un contenu "import { useState }" absent du fichier. Il a dû relire les fichiers puis refaire l’édition.
