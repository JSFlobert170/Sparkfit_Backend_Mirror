# 1.1. Description du processus de mise à jour des dépendances

## A. Fréquence des mises à jour

- Dépendances critiques : vérification mensuelle.
- Veille automatisée via GitLab CI/CD (`dependency_check`).
- Scan manuel complet à chaque montée de version majeure.

## B. Types de mise à jour

### Manuelles

- `npm run deps:update`
- `npm run deps:audit`
- Lecture changelog et adaptation du code si nécessaire.
- Tests Jest systématiques (`npm run test:all`).

### Automatiques

- Patchs/mineures auto-mergées via RenovateBot (`renovate.json`).
- En cas de CVE critique, mise à jour immédiate + tests sur staging.

### ORM / BDD

- Prisma synchronisé à chaque évolution du modèle.
- Migrations générées (`npm run prisma:migrate`) et testées sur staging.
