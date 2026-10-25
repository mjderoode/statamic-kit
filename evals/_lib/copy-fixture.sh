#!/usr/bin/env bash
# Copy a shared fixture project into the eval run's (empty) workspace.
# Usage: bash copy-fixture.sh <fixture-name>
set -euo pipefail
name="${1:?fixture name required}"
lib="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$lib/../fixtures/$name"
if [ ! -d "$src" ]; then
  echo "fixture not found: $name" >&2
  exit 1
fi
cp -R "$src/." .
