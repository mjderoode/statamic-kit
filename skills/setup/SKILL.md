---
name: setup
description: This skill should be used when the user asks to create a NEW Statamic site from scratch — "set up a new Statamic site", "scaffold a Statamic project", "create a fresh Statamic install called acme", "start a new Statamic site on MageBox", or Dutch phrasing such as "maak een nieuwe Statamic-site" or "start een nieuw Statamic-project". It installs Statamic 6 with Antlers, a page-builder skeleton, globals, a main navigation, a contact form, a super user and a first commit. Not for changing an existing site — blueprints, collections, fields, forms, templates, roles and content on a site that already exists are the blueprints, forms, templates and users skills.
---

# New Statamic site

Create a new, running Statamic 6 site with the bundled scaffolder, so it
starts out the way the kit's other skills expect to find one: Antlers,
Tailwind 4 + Vite, a page-builder blueprint with block partials, globals, a
main navigation, a contact form, a super user and a first git commit. On
MageBox the site runs on `https://<name>.test` with mail to Mailpit; without
MageBox it runs on `http://localhost:8000` via `php artisan serve` with mail
to the log.

**Antlers only.** If the user asks for Blade, say Blade is not offered by
this skill and that the site will use Antlers; let them decide whether to go
ahead.

## Workflow

### 1. Check MageBox

Run `command -v magebox`.

- Found → plan the MageBox variant.
- Missing → **say so plainly** ("MageBox is not installed"), and plan the
  variant without it (`--no-magebox`): the site on `http://localhost:8000`
  served by `php artisan serve`, mail written to the log (`MAIL_MAILER=log`,
  no Mailpit). Mention that they can also install MageBox first and ask
  again to get the `https://<name>.test` variant.

### 2. Check the rest — read-only

Run only commands that change nothing:

- PHP of the planned version (default 8.4): `php -v` on PATH, else
  `/opt/homebrew/opt/php@<version>/bin/php -v` (or `/usr/local/opt/…`).
  A MageBox `php` wrapper (a path under `.magebox/bin`) does not count; the
  script takes it off PATH.
- `composer --version`, `npm --version`, `git --version`.
- The target directory `<dir>/<name>` does not exist, or is empty.

Anything missing goes into the plan as a blocker with the install hint; do not
install anything yourself.

### 3. Present the plan — hard gate

Present, before running anything:

- **Name**: lowercase letters, digits and dashes (`^[a-z0-9][a-z0-9-]*$`);
  propose a slug if the user gave something else ("Acme Site" → `acme-site`).
- **Target path**, in full: `<dir>/<name>`. The default parent is the
  current directory — **but if the current directory is itself a project**
  (it has a `composer.json` or a `.git`), propose its **parent** directory
  as `--dir`, so the new site lands beside the current project, not inside
  it. Say why.
- **Variant**: MageBox (`https://<name>.test`, Mailpit on
  http://localhost:8025) or `--no-magebox` (`http://localhost:8000`, mail to
  the log), from step 1.
- **PHP version**: 8.4 unless the user asked for another.
- **Super user**: ask for the email address and the password. Offer a
  generated password (for example from `openssl rand -base64 18`) as an
  option. **Never** propose `test`, `password`, `secret` or any other weak
  default.
- **What gets created**: Statamic 6 + Laravel, `.env`, Tailwind 4 + Vite
  (built once), the page-builder skeleton (blueprint, block partials, home
  page), globals, the main navigation, the contact form, the super user,
  `CLAUDE.md`, and a first commit on `main`. With `--bare` (only if asked):
  Statamic + `CLAUDE.md` only.
- Blockers from step 2, if any.

Then **stop and wait for approval — no Bash that creates or installs
anything, no Write or Edit, in the same turn.** The plan is only complete
once the user has given the email and password (or accepted the generated
one). Even a request that says "go ahead" still needs the credentials; ask
for them rather than inventing them.

### 4. Run the scaffolder

With the approved values only:

```sh
bash "${CLAUDE_PLUGIN_ROOT}/skills/setup/scripts/new-statamic.sh" <name> \
  --email <address> --password <pw> \
  [--dir <parent>] [--php <version>] [--no-magebox] [--bare]
```

- Wrap every value in single quotes (a `$`, backtick or `!` in a password
  is mangled in double quotes); write a single quote inside a value as
  `'\''`. The script runs Composer and npm and takes several minutes, which
  can exceed the Bash tool's 10-minute limit: run it in the background and
  wait for it to finish, rather than in the foreground. Relay any `!`
  warning lines it printed (for example a `magebox start` warning), even on
  success.
- Exit 0 is success. On a non-zero exit the script prints an `error: …`
  line, or — when Composer, npm or artisan failed — that tool's own output
  followed by a `Failed. …` line, on stderr. Relay whichever it printed
  (with the tool's last error lines in the second case), and do not retry
  with other values without asking. When the script says the half-built
  project is still at a path, tell the user to delete that directory before
  a retry; do not delete it yourself unasked.
- Note the PHP binary from the `php` line in the script's preflight output
  (and, without MageBox, the `… artisan serve` line under **Next**). That is
  the real PHP binary; use it for every check below, never a MageBox `php`
  wrapper.

### 5. Verify

In `<dir>/<name>`, with `$PHP` the binary from step 4:

- `"$PHP" please stache:warm` exits 0.
- `git log -1 --oneline` shows the initial commit.
- MageBox variant:
  - `curl -sk -o /dev/null -w '%{http_code}' https://<name>.test` → `200`,
    **and** `curl -sk https://<name>.test | grep -q '<Project Name>'` succeeds,
    where `<Project Name>` is the name as rendered in the nav (the slug with
    dashes turned into spaces and each word capitalised: `acme-site` →
    `Acme Site`). Another MageBox project's catch-all vhost can answer
    `.test` with a 200; the name in the body proves it is this site.
    **With `--bare`** Statamic's own home page does not show the name, so
    prove it another way: write a random token to `public/setup-check.txt`,
    check that `curl -sk https://<name>.test/setup-check.txt` returns exactly
    that token, then delete the file (before or after, never commit it).
  - `curl -sk -o /dev/null -w '%{http_code} %{redirect_url}' https://<name>.test/cp`
    → a redirect (`302`) to the Control Panel login.
- Without MageBox:
  - **First** run `lsof -ti tcp:8000`. If anything already listens on port
    8000, do not start a server and do not touch that process: report the
    two HTTP checks as **not verified** (port 8000 already in use).
  - Otherwise start `"$PHP" artisan serve --port=8000` in the background
    for the check only, wait until it answers, and record the PIDs that now
    listen (`lsof -ti tcp:8000` — this includes the `php -S` child that
    `artisan serve` spawns). Run the same two `curl` checks against
    `http://localhost:8000` and `http://localhost:8000/cp`, and the same
    project-name `grep` against `http://localhost:8000` (with `--bare`, the
    same `setup-check.txt` token check instead).
  - Stop the server afterwards by killing only the background `artisan
    serve` process and the PIDs you recorded — never anything else on the
    port.

Report each check as passed or failed. Anything that could not be run (no
network to the `.test` domain, port 8000 already taken, …) is reported as
**"not verified"** with the reason — never as passed.

### 6. Hand-off

Tell the user:

- The site URL and the Control Panel URL (`<url>/cp`), the login email (and
  that the password is the one they chose), and Mailpit
  (http://localhost:8025) on MageBox.
- How to work on it: `cd <dir>/<name>`, `npm run dev` for Vite; without
  MageBox, `"$PHP" artisan serve` to serve it.
- That `CLAUDE.md` in the new project lists its conventions and traps.
- That the kit's `blueprints`, `forms` and `templates` skills take it from
  here (new blocks, collections, fields, forms and page templates), and
  `users` for roles and groups.

## Out of scope

Changing an existing site (blueprints, forms, templates, users skills), Blade
templates, multisite, the Eloquent driver, Pro features, starter kits, other
local hosts (Herd, Valet, Sail), and content beyond the home page.
