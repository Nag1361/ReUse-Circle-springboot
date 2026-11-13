#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/frontend"
if [ ! -f .env ]; then cp .env.example .env; fi
# npm ci keeps installed dependencies consistent with package-lock.json.
bash ./npmw ci
exec bash ./npmw run dev -- "$@"
