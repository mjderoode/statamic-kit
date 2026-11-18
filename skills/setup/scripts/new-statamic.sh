#!/usr/bin/env bash
#
# new-statamic.sh — scaffold a complete, running Statamic 6 site.
#
# Run by statamic-kit's setup skill. Installs Statamic + Laravel, wires up a
# MageBox dev environment on https://<name>.test (or none, with --no-magebox),
# lays down a page-builder skeleton (blueprint, block partials, globals,
# Tailwind 4) and writes a CLAUDE.md so an agent picking the project up already
# knows the traps.
#
# Usage: new-statamic.sh <name> [options]     (see --help)

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STUBS="$SCRIPT_DIR/../stubs"

# The stubs are written for these majors. Raise them together with the stubs.
STATAMIC_CONSTRAINT="^6.0"
NPM_DEV_PACKAGES=(
    "tailwindcss@^4"
    "@tailwindcss/vite@^4"
    "@tailwindcss/typography@^0.5"
    "laravel-vite-plugin@^3"
    "vite@^8"
    "concurrently@^10"
)

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------

PHP_VERSION="8.4"
PARENT_DIR="$PWD"
EMAIL=""
PASSWORD=""
USE_MAGEBOX=1
BARE=0
SLUG=""

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

if [[ -t 1 ]]; then
    BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'
    YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
    BOLD=""; DIM=""; RED=""; GREEN=""; YELLOW=""; BLUE=""; RESET=""
fi

step_no=0
step()  { step_no=$((step_no + 1)); printf '\n%s[%d/%d]%s %s%s%s\n' "$BLUE" "$step_no" "$TOTAL_STEPS" "$RESET" "$BOLD" "$1" "$RESET"; }
note()  { printf '      %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn()  { printf '%s  !   %s%s\n' "$YELLOW" "$1" "$RESET" >&2; }
# Set once the project directory is being built; from then on every failure,
# whether through die or the ERR trap, says the half-built project is left.
BUILDING=0
half_built() {
    [[ -d "$APP_DIR" ]] || return 0
    printf '\n%sFailed.%s The half-built project is still at %s — delete it before retrying.\n' "$RED" "$RESET" "$APP_DIR" >&2
}
die()   {
    printf '\n%serror:%s %s\n' "$RED" "$RESET" "$1" >&2
    [[ $BUILDING -eq 1 && -d "$APP_DIR" ]] && half_built
    exit 1
}

usage() {
    cat <<EOF
${BOLD}new-statamic.sh${RESET} — scaffold a complete Statamic 6 site

${BOLD}USAGE${RESET}
    new-statamic.sh <name> --email <address> --password <pw> [options]

${BOLD}OPTIONS${RESET}
    --email <address>   Super user email                   (required)
    --password <pw>     Super user password                (required)
    --dir <path>        Parent directory for the project   (default: current directory)
    --php <version>     PHP version to build against       (default: 8.4)
    --no-magebox        Skip the MageBox environment; serve it yourself
    --bare              Statamic + CLAUDE.md only, no page-builder skeleton
    -h, --help          Show this help

${BOLD}EXAMPLES${RESET}
    new-statamic.sh acme-site --email me@example.com --password hunter2
    new-statamic.sh acme-site --dir ~/Sites --email me@example.com --password hunter2
    new-statamic.sh acme-site --email me@example.com --password hunter2 --bare --no-magebox
EOF
}

# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)    usage; exit 0 ;;
        --dir)        PARENT_DIR="${2:?--dir needs a path}"; shift 2 ;;
        --php)        PHP_VERSION="${2:?--php needs a version}"; shift 2 ;;
        --email)      EMAIL="${2:?--email needs an address}"; shift 2 ;;
        --password)   PASSWORD="${2:?--password needs a value}"; shift 2 ;;
        --no-magebox) USE_MAGEBOX=0; shift ;;
        --bare)       BARE=1; shift ;;
        -*)           die "unknown option: $1  (try --help)" ;;
        *)
            [[ -n "$SLUG" ]] && die "only one project name expected, got '$SLUG' and '$1'"
            SLUG="$1"; shift ;;
    esac
done

[[ -n "$SLUG" ]] || { usage; exit 1; }
[[ "$SLUG" =~ ^[a-z0-9][a-z0-9-]*$ ]] || die "project name must be lowercase letters, digits and dashes: '$SLUG'"

[[ -n "$EMAIL" ]] || die "--email is required"
[[ -n "$PASSWORD" ]] || die "--password is required"

PARENT_DIR="${PARENT_DIR/#\~/$HOME}"
APP_DIR="$PARENT_DIR/$SLUG"
TOTAL_STEPS=$(( USE_MAGEBOX == 1 ? 10 : 9 ))

PROJECT_NAME="$(printf '%s' "$SLUG" | perl -pe 's/[-_]+/ /g; s/(\w+)/\u$1/g')"
if [[ $USE_MAGEBOX -eq 1 ]]; then
    SITE_URL="https://$SLUG.test"
else
    SITE_URL="http://localhost:8000"
fi

# ---------------------------------------------------------------------------
# 1. Preflight
# ---------------------------------------------------------------------------

step "Preflight"

[[ -d "$STUBS" ]] || die "stubs directory missing at $STUBS"
[[ -e "$APP_DIR" && -n "$(ls -A "$APP_DIR" 2>/dev/null)" ]] && die "$APP_DIR already exists and is not empty"
[[ -d "$PARENT_DIR" ]] || die "parent directory does not exist: $PARENT_DIR"

# The MageBox php wrapper has a recursion guard that trips when an installer
# shells out to Composer, so it is taken off PATH for the whole run and real
# binaries are pinned below. This also holds with --no-magebox: MageBox may be
# installed on the machine even when this project does not use it.
PATH="$(printf '%s' "$PATH" | tr ':' '\n' | grep -v '\.magebox/bin' | paste -sd: -)"
export PATH

resolve_php() {
    local candidate
    # A php on PATH wins, but only if it is the version asked for.
    if command -v php >/dev/null 2>&1 &&
       [[ "$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')" == "$PHP_VERSION" ]]; then
        command -v php
        return 0
    fi
    for candidate in "/opt/homebrew/opt/php@$PHP_VERSION/bin/php" \
                     /opt/homebrew/Cellar/"php@$PHP_VERSION"/*/bin/php \
                     "/usr/local/opt/php@$PHP_VERSION/bin/php"; do
        [[ -x "$candidate" ]] && { printf '%s' "$candidate"; return 0; }
    done
    return 1
}

# Composer's own launcher is fine; the MageBox one is a bash wrapper around the
# php wrapper, so skip anything whose shebang says bash.
resolve_composer() {
    local dir
    local IFS=':'
    for dir in $PATH; do
        [[ -x "$dir/composer" ]] || continue
        head -1 "$dir/composer" 2>/dev/null | grep -q 'bash' && continue
        printf '%s' "$dir/composer"
        return 0
    done
    return 1
}

PHP="$(resolve_php)" || die "no PHP $PHP_VERSION found. Install PHP $PHP_VERSION (for example with Homebrew or your package manager), or put a php $PHP_VERSION binary first on PATH."
COMPOSER="$(resolve_composer)" || die "no usable Composer found on PATH"

command -v npm >/dev/null 2>&1 || die "npm not found"
command -v git >/dev/null 2>&1 || die "git not found"
command -v perl >/dev/null 2>&1 || die "perl not found"
if [[ $USE_MAGEBOX -eq 1 ]]; then
    command -v magebox >/dev/null 2>&1 || die "magebox not found. Re-run with --no-magebox to skip the dev environment."
fi

note "php       $PHP ($("$PHP" -r 'echo PHP_VERSION;'))"
note "composer  $COMPOSER"
note "target    $APP_DIR"
note "url       $SITE_URL"

# The token in ~/.composer/auth.json expires; gh's is current. It is passed to
# the Composer calls only (never exported), so npm, magebox, artisan and git
# do not see it.
COMPOSER_AUTH_JSON=""
if command -v gh >/dev/null 2>&1 && GH_TOKEN="$(gh auth token 2>/dev/null)" && [[ -n "$GH_TOKEN" ]]; then
    COMPOSER_AUTH_JSON="{\"github-oauth\":{\"github.com\":\"$GH_TOKEN\"}}"
    note "auth      github token from gh"
else
    warn "no gh token available; Composer may hit GitHub rate limits"
fi

BUILDING=1
trap half_built ERR

# ---------------------------------------------------------------------------
# 2. Install Statamic
# ---------------------------------------------------------------------------

step "Installing Statamic"

COMPOSER_AUTH="$COMPOSER_AUTH_JSON" "$PHP" "$COMPOSER" create-project --no-interaction --prefer-dist statamic/statamic "$APP_DIR" "$STATAMIC_CONSTRAINT"
cd "$APP_DIR"

# Informational only: awk stops reading early, which can fail the pipe.
STATAMIC_VERSION="$(COMPOSER_AUTH="$COMPOSER_AUTH_JSON" "$PHP" "$COMPOSER" show statamic/cms --no-interaction 2>/dev/null | awk '/^versions/ {print $NF; exit}' || true)"
note "statamic/cms ${STATAMIC_VERSION:-installed}"

# ---------------------------------------------------------------------------
# 3. Environment file
# ---------------------------------------------------------------------------

step "Writing .env"

[[ -f .env ]] || cp .env.example .env

set_env() {
    local key="$1" value="$2"
    KEY="$key" VALUE="$value" perl -i -pe '
        BEGIN { $k = $ENV{KEY}; $v = $ENV{VALUE}; }
        $_ = "$k=$v\n" if /^#?\s*\Q$k\E=/;
    ' .env
    grep -q "^$key=" .env || printf '%s=%s\n' "$key" "$value" >> .env
}

set_env APP_NAME "\"$PROJECT_NAME\""
set_env APP_URL "$SITE_URL"
if [[ $USE_MAGEBOX -eq 1 ]]; then
    # MageBox ships Mailpit on 1025, not the 2525 the generated .env carries.
    set_env MAIL_MAILER smtp
    set_env MAIL_HOST 127.0.0.1
    set_env MAIL_PORT 1025
    set_env MAIL_FROM_ADDRESS "\"no-reply@$SLUG.test\""
else
    set_env MAIL_MAILER log
fi

"$PHP" artisan key:generate --ansi --no-interaction >/dev/null
if [[ $USE_MAGEBOX -eq 1 ]]; then
    note "APP_URL=$SITE_URL, mail to Mailpit on :1025"
else
    note "APP_URL=$SITE_URL, mail goes to the log"
fi

# ---------------------------------------------------------------------------
# 4. MageBox
# ---------------------------------------------------------------------------

if [[ $USE_MAGEBOX -eq 1 ]]; then
    step "Setting up MageBox"

    magebox init "$SLUG" --type laravel >/dev/null

    CONFIG=""
    for candidate in .magebox.yaml .magebox.yml .magebox; do
        [[ -f "$candidate" ]] && { CONFIG="$candidate"; break; }
    done
    [[ -n "$CONFIG" ]] || die "magebox init did not produce a config file"

    # Pin the PHP version; init does not take a --php flag.
    if grep -q '^php:' "$CONFIG"; then
        PHP_VERSION="$PHP_VERSION" perl -i -pe 's/^php:.*/php: "$ENV{PHP_VERSION}"/' "$CONFIG"
    else
        printf 'php: "%s"\n' "$PHP_VERSION" >> "$CONFIG"
    fi

    # Statamic keeps its content in flat files, so the Docker-backed services
    # (MySQL, Redis) are not needed to serve the site. Don't let a stopped
    # Docker daemon take the whole scaffold down — nginx and php-fpm are native.
    magebox start || warn "magebox start reported problems; continuing (nginx + php-fpm are what this site needs)"
    note "serving $SITE_URL"
fi

# ---------------------------------------------------------------------------
# 5. Front-end toolchain
# ---------------------------------------------------------------------------

step "Installing the front-end toolchain"

npm install --silent --save-dev "${NPM_DEV_PACKAGES[@]}"

cp "$STUBS/vite.config.js" vite.config.js
mkdir -p resources/css resources/js
cp "$STUBS/resources/css/site.css" resources/css/site.css
cp "$STUBS/resources/js/site.js" resources/js/site.js
note "Tailwind 4 via @tailwindcss/vite, entries resources/css/site.css + resources/js/site.js"

# ---------------------------------------------------------------------------
# 6. Page-builder skeleton
# ---------------------------------------------------------------------------

if [[ $BARE -eq 0 ]]; then
    step "Laying down the page-builder skeleton"

    cp -R "$STUBS/resources/blueprints/." resources/blueprints/
    cp -R "$STUBS/resources/views/." resources/views/
    mkdir -p resources/forms && cp -R "$STUBS/resources/forms/." resources/forms/
    mkdir -p app/Modifiers && cp -R "$STUBS/app/Modifiers/." app/Modifiers/
    cp -R "$STUBS/content/." content/

    blocks=$(find resources/views/blocks -name '*.antlers.html' | wc -l | tr -d ' ')
    note "$blocks block partials, main navigation, globals social/brand, contact form, AutoLink modifier"
else
    step "Skipping the skeleton (--bare)"
fi

# ---------------------------------------------------------------------------
# 7. CLAUDE.md
# ---------------------------------------------------------------------------

step "Writing CLAUDE.md"

cp "$STUBS/CLAUDE.md.tpl" CLAUDE.md

# Without the skeleton the Architecture section describes a shape that is not on
# disk yet. Say so, rather than letting it read as a description of this repo.
if [[ $BARE -eq 1 ]]; then
    perl -i -pe 's{^## Architecture$}{> **Scaffolded with --bare**, so none of the structure below exists yet: no page\n> blueprint, no block partials, no globals. Architecture describes the shape to\n> build towards, not what is on disk. Delete it if this project goes another way.\n\n## Architecture}' CLAUDE.md
fi

# Variant blocks: keep the matching one, drop the other, strip the marker lines.
if [[ $USE_MAGEBOX -eq 1 ]]; then
    KEEP=magebox DROP=no-magebox
else
    KEEP=no-magebox DROP=magebox
fi
KEEP="$KEEP" DROP="$DROP" perl -i -ne '
    BEGIN { $k = $ENV{KEEP}; $d = $ENV{DROP}; $skip = 0; }
    if (/^<!-- \Q$d\E -->$/)  { $skip = 1; next }
    if (/^<!-- \/\Q$d\E -->$/) { $skip = 0; next }
    next if $skip;
    next if /^<!-- \/?\Q$k\E -->$/;
    print;
' CLAUDE.md

# Every placeholder in every stubbed file resolves here. The home entry's id is
# generated per project because the page tree references entries by id.
new_uuid() {
    if command -v uuidgen >/dev/null 2>&1; then
        uuidgen
    elif [[ -r /proc/sys/kernel/random/uuid ]]; then
        cat /proc/sys/kernel/random/uuid
    else
        "$PHP" -r '$b = random_bytes(16); $b[6] = chr(ord($b[6]) & 0x0f | 0x40); $b[8] = chr(ord($b[8]) & 0x3f | 0x80); vprintf("%s%s-%s-%s-%s-%s%s%s", str_split(bin2hex($b), 4));'
    fi
}
HOME_ID="$(new_uuid | tr '[:upper:]' '[:lower:]')"
PHP_BINARY="$PHP"
export PROJECT_NAME PROJECT_SLUG="$SLUG" SITE_URL HOME_ID PHP_VERSION PHP_BINARY

while IFS= read -r file; do
    perl -i -pe '
        s/__PROJECT_NAME__/$ENV{PROJECT_NAME}/g;
        s/__PROJECT_SLUG__/$ENV{PROJECT_SLUG}/g;
        s/__SITE_URL__/$ENV{SITE_URL}/g;
        s/__HOME_ID__/$ENV{HOME_ID}/g;
        s/__PHP_VERSION__/$ENV{PHP_VERSION}/g;
        s/__PHP_BINARY__/$ENV{PHP_BINARY}/g;
    ' "$file"
done < <(grep -rl '__[A-Z_]\+__' CLAUDE.md resources content app 2>/dev/null || true)

note "$(wc -l < CLAUDE.md | tr -d ' ') lines of Statamic guidance"

# ---------------------------------------------------------------------------
# 8. Super user
# ---------------------------------------------------------------------------

step "Creating the super user"

"$PHP" please make:user "$EMAIL" --password="$PASSWORD" --super --no-interaction
note "$EMAIL (password as chosen)"

# ---------------------------------------------------------------------------
# 9. Build and clear
# ---------------------------------------------------------------------------

step "Building assets and clearing caches"

npm run build --silent
"$PHP" please stache:clear
"$PHP" please cache:clear

# ---------------------------------------------------------------------------
# 10. Git
# ---------------------------------------------------------------------------

step "Initialising git"

git init -q -b main
git add -A
git -c user.useConfigOnly=false commit -q -m "Initial Statamic install

Scaffolded with the statamic-kit setup skill: Statamic 6 on PHP $PHP_VERSION, Tailwind 4 via
Vite, page-builder blueprint with block partials, globals and a contact form."
note "committed $(git rev-list --count HEAD) commit on main"

trap - ERR
BUILDING=0

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

cat <<EOF

${GREEN}${BOLD}$PROJECT_NAME is up.${RESET}

  site      $SITE_URL
  cp        $SITE_URL/cp
  login     $EMAIL (password as chosen)
EOF
[[ $USE_MAGEBOX -eq 1 ]] && printf '  mailpit   http://localhost:8025\n'
cat <<EOF
  path      $APP_DIR

${BOLD}Next${RESET}
  cd $APP_DIR
  npm run dev            # Vite, with hot reload
EOF
[[ $USE_MAGEBOX -eq 0 ]] && printf '  %s artisan serve\n' "$PHP"
cat <<EOF

  Read CLAUDE.md first — it covers the traps that cost real time
  (the page tree wants entry ids, forms are two files, Tailwind needs a rebuild).
EOF
