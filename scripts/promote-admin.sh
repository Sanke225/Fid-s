#!/usr/bin/env sh
# Donne le rôle admin à un compte existant. Seul moyen de devenir admin : jamais depuis l'interface.
# Usage (dev) : pnpm admin:promote prenom@exemple.com
# La personne doit d'abord s'être inscrite normalement.
set -eu

email="${1:-}"
if [ -z "$email" ]; then
  echo "Usage : pnpm admin:promote <email>" >&2
  exit 1
fi

# L'e-mail passe par une variable psql (:'email'), jamais concaténé dans le SQL.
docker compose -f infra/docker-compose.dev.yml exec -T db \
  psql -U recette -d recette -v ON_ERROR_STOP=1 -v email="$email" <<'SQL'
UPDATE users SET role = 'admin', updated_at = now() WHERE email = :'email' RETURNING email, role;
SQL
