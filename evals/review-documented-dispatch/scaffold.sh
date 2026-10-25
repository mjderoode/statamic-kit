#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/copy-fixture.sh" review-antlers
bash "$here/../_lib/copy-fixture.sh" review-documented-overlay
