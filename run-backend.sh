#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/backend"
if ! command -v javac >/dev/null 2>&1 && [ ! -x "${JAVA_HOME:-/nonexistent}/bin/javac" ]; then
  echo 'Install JDK 17 or 21 first. Maven is downloaded by the wrapper.' >&2
  exit 1
fi
if [ ! -f application-local.properties ] && { [ -z "${DB_USERNAME:-}" ] || [ -z "${DB_PASSWORD:-}" ] || [ -z "${JWT_SECRET:-}" ]; }; then
  echo 'Copy backend/application-local.properties.example to backend/application-local.properties.' >&2
  echo 'Set your MySQL credentials and JWT secret as explained in README.md, then run again.' >&2
  exit 1
fi
exec sh ./mvnw spring-boot:run "$@"
