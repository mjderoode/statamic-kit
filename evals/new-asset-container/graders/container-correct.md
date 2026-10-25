---
type: llm
focus: trace
---

Judge the new brochures asset container. The existing `assets` container uses disk `assets` (root `public_path('assets')`, url `/assets`) in `config/filesystems.php`.
PASS if all hold:
- a container config `content/assets/<handle>.yaml` with a `title` and a `disk:`;
- that disk exists in `config/filesystems.php` under `disks`, modelled on the `assets` disk, with its **own** root that does not overlap `public_path('assets')` (a subfolder of it is also an overlap), and a matching public `url`; existing disks are unchanged; the PHP is valid;
- the page blueprint gets a new `assets` field with `container: <the new handle>` (a single file, e.g. `max_files: 1`); `hero_image` still uses `container: assets`;
- PDF-only is enforced or suggested (e.g. `validate:` with `mimes:pdf` on the container or field) — mentioning it in the reply is enough.
FAIL if the container reuses the `assets` disk or an overlapping root, the disk is missing from `config/filesystems.php`, the field points at the wrong container, or existing disks/fields changed.
