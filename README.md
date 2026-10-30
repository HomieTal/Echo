# Echo OS — launch website

A dependency-free static launch site for **Echo OS**, an Arch-based operating
system with modular Boot, Core, and Install layers. The design is
**structure-informed**: it follows the page architecture and design system
observed on GitHub Universe 2026 (editorial light canvas, 1px rule grid,
oversized low-weight display type, mono microcopy, countdown bar, ticker,
feature river, tabbed option cards, day-column roadmap, quote carousel,
oversized footer wordmark) — implemented from scratch with original Echo OS
branding, copy, diagrams, and motion. No GitHub branding, copy, fonts, or
assets are used.

The previous dark "signal" design is preserved in
[`reports/legacy-echo-site/`](../reports/legacy-echo-site/).

The site lives outside the `EchoOS-DEV` distribution source tree. It does not
build, modify, or redistribute the OS image.

**Live:** <https://homietal.github.io/Echo/> — deployed from
[`HomieTal/Echo`](https://github.com/HomieTal/Echo)
(GitHub Pages, `main` branch, repo root). Every push to `main` redeploys.

---

## Run locally

No Node, npm, or build step is required.

```bash
cd /home/ghost/reference-research/echoos-website
python3 -m http.server 8080
```

Open <http://localhost:8080>.

For a one-off check with a different port:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

The site uses only relative paths, so it can also be served from a subdirectory.
A static host (GitHub Pages, Netlify, Cloudflare Pages, S3, nginx) only needs the
contents of this directory.

---

## Structure

```text
echoos-website/
├── index.html                  # single-page launch site
├── get-started.html            # step-by-step walkthrough (filter tabs)
├── 404.html                    # optional static-host not-found page
├── assets/
│   ├── css/styles.css          # tokens, layout, components, responsive rules
│   ├── js/main.js              # menu, countdown, trail, tabs, modals, carousel,
│   │                           # playlist, boot, copy, reveal
│   ├── fonts/                  # self-hosted WOFF2 + OFL license texts
│   ├── img/                    # original mark, favicon, social card
│   │   └── contributors/       # GitHub avatars (downloaded, self-hosted)
│   └── screenshots/            # genuine VM captures (boot menu, LightDM login)
├── downloads/SHA256SUMS        # checksum reference for the public release
├── downloads/latest-release.json  # auto-synced release data (see below)
├── .github/workflows/sync-release.yml  # daily sync job (see below)
├── site.webmanifest
├── robots.txt
└── README.md
```

### Design system

- **Tokens:** sage-grey canvas `#e9edec`, 1px borders `#d2d9d4`, near-black ink,
  muted grey-green copy, one green accent `#08872b`, dark band only for the
  countdown bar; the hero stage and visual tiles use the light blueprint
  gridline canvas.
- **Type:** Space Grotesk variable for display and body (large sizes, low
  weights ~450, tight line-height), IBM Plex Mono for labels, meta, code, and
  statuses. Mono section labels use the `label/` and `echo.*()` conventions.
- **Sections (GitHub Universe order):** countdown bar → nav → hero with
  oversized wordmark + plug-and-play statement + interactive boot sequence →
  auto-typing color ticker → river intro + three alternating 50/50 rows →
  `get-the-iso/` tabbed card pairs with numbered "What's included" lists →
  `the-components/` tile grid with detail dialogs → `roadmap/` day columns →
  `trust-but-verify/` status carousel → `see-it-run/` featured frame + playlist
  → oversized footer wordmark.
- **Sub-page:** `get-started.html` mirrors the on-the-road page pattern —
  hero, filter tabs (`all/ run/ install/ build/`), and six step entries.
- **Signature motion:** hero wordmark auto-types "echo os" on load with a
  blinking block cursor; the hero boot sequence **auto-plays** after the
  wordmark (Replay button kept) and then cycles the genuine captures —
  boot menu and LightDM login — inside the gridline stage; the ticker is a
  strip of colored segments (green / mustard / purple) carrying a 16 px mono
  status line with arrow icons and a square pause control; a pointer trail of
  grid-snapped colored glyph blocks (six-color palette, terminal glyphs,
  ~100–400 ms pop-in/out) follows the mouse over content, skipping buttons,
  links, and the echo os wordmarks. All degrade: without JS everything is
  static, and `prefers-reduced-motion` disables the trail, marquee, typing,
  autoplay, and slideshow.
- **Layout:** full-width bands capped at 1600 px, 24 px gutters (20 px mobile),
  390 / 640 / 1024 breakpoints, fluid `clamp()` type.
- **Motion:** 120 s ticker marquee with pause control, blinking cursors, boot
  sequence line reveal, subtle scroll reveals, and a complete
  `prefers-reduced-motion` fallback.
- **No external requests:** fonts and images are local; no analytics, tracking,
  or third-party embeds. Original CSS diagrams replace photography until real
  screenshots are captured from the ISO.

---

## Verified download

The site links to the latest **published** GitHub release, not the newer local
build in `EchoOS-DEV/out/`.

| Field | Value |
| --- | --- |
| Release | `v3.0.0` — EchoOS Fox v3.0.0 — 3rd Release (KDE Plasma 6 + SDDM) |
| Published | 2026-10-30 |
| File | `echoos-fox-2026.10.29-x86_64.iso` — split into two 2 GB parts (`part-00` + `part-01`); rejoin with `cat .part-* > iso` |
| Size | 2,469,281,792 bytes joined (2.30 GiB) |
| SHA-256 | `d53967698415d09fa33d3c3b43c6bf790b7738253b5dfeff9127d66d364adec7` |
| Source | <https://github.com/HomieTal/EchoOS-DEV/releases/tag/v3.0.0> |

The checksum is published in the release and ships as the SHA256SUMS release
asset. `downloads/SHA256SUMS` is a local convenience copy; the ISO itself is not
stored in this website directory.

Do not point the download button at `out/echoos-fox-2026.10.30-x86_64.iso`.
That build is newer (the drafted v3.0.1 installer bootloader fix), but it is
not published and the draft release has no ISO assets attached yet.

---

## Automatic release sync

The site no longer needs a manual pass when EchoOS-DEV publishes a new release.

**How it works**

1. `.github/workflows/sync-release.yml` runs daily (and on demand via
   *Run workflow*) and calls the GitHub API for the latest **published**
   release of `HomieTal/EchoOS-DEV` (drafts and prereleases are ignored).
2. It extracts the tag, name, publish date, ISO filename, part count, total
   size, and the joined-ISO checksum taken from the release's own
   `SHA256SUMS` asset, and writes `downloads/latest-release.json` plus the
   `downloads/SHA256SUMS` convenience copy. If nothing changed, it exits
   without a commit.
3. On page load, `assets/js/main.js` fetches `downloads/latest-release.json`
   (same-origin, so the no-external-requests design and the CSP stand) and
   updates every element marked with a `data-release-*` attribute:
   download links, tag, date, size, ISO filename, rejoin command, and the
   checksum. The hardcoded markup is the fallback, so the page stays correct
   with JavaScript off or the fetch failing.

**Limits to know**

- The workflow trusts the release's own SHA256SUMS asset; it does not download
  and re-hash the multi-GB ISO. Independent verification happens on the
  user's machine (`sha256sum -c SHA256SUMS` after rejoining) — which is the
  site's whole trust model anyway.
- The workflow only refreshes *numbers and links*. Prose that describes what
  the release contains (Plasma vs XFCE, feature claims, roadmap) still needs
  a human update when the feature set changes.
- The `cat … .part-*` sentence structure assumes a split release; if a future
  release returns to single-file assets, the static sentence should be
  adjusted manually (links and checksum still update automatically).

---

## Product claims and status

The marketing is deliberately tied to what the current preview actually does.

| Claim on the page | Status | Evidence |
| --- | --- | --- |
| Plug-and-play: live USB boots on any x86_64 machine | Shipped in preview (phrase says "any" — BIOS VMware verified on earlier previews; other hardware inherited from Arch) | Release notes, archiso bootmodes |
| Install offline in minutes | Offline install shipped; the earlier ISO installed in ~4 min in one VMware (BIOS) run | Release notes |
| Arch-based OS | Shipped in preview | ArchISO profile, pkglist, build report |
| BIOS + UEFI live boot | Shipped (BIOS syslinux + UEFI rEFInd in v3.0.0; BIOS install boot fixed in v3.0.0) | Release notes |
| KDE Plasma 6 live session with SDDM autologin | Shipped in v3.0.0 | Release notes, EchoOS SDDM config, branding assets |
| Calamares offline installer with EchoOS branding | Shipped in v3.0.0 (branding + Calamares rework) | Release notes |
| Offline full-disk install | Shipped in preview (verified in VMware on earlier previews) | Release notes |
| ~4 minute install | Verified once in VMware Workstation 26 (BIOS) on the 2026.10.24 preview; not re-verified on v3.0.0 | Release notes |
| Echo Boot / Core / Install / Desktop components | Populated (echo-desktop added in v3.0.0), modular assembly in progress | Component READMEs, docs |
| AI on OS (Aira as the headline vision) | Positioning only — Aira is planned, not shipped | Every mention keeps "in development / planned" |
| Aira AI layer | Planned, not shipped | No implementation or integration point in repo |
| "World's first AI-native OS" | Ambition, not a shipped capability | Kept out of the hero; status carried by receipts/roadmap |

**Do not remove the Aira footnote or the roadmap status without changing the
claims.** The preview contains no AI features.

**Screenshots lag the release:** the on-page captures are still from the
XFCE/LightDM 2026.10.24 preview and are captioned as such. Do not caption them
as Plasma until genuine v3.0.0 captures replace them.

The footer states that **no license file is currently published** in the EchoOS
repository. Do not replace this with GPL/MIT wording unless the project actually
adds a license.

---

## Screenshots

Genuine captures from the user's VM testing are now in use:

- `assets/screenshots/boot-menu.png` — Echo OS boot menu (stock Arch ISO menu) in
  VMware; used in the boot river tile and the proof boot slot. Stock branding is
  visible and honestly captioned.
- `assets/screenshots/live-login.png` — LightDM live-user login from the
  XFCE-era 2026.10.24 preview; used in the core river tile and the proof
  live-session slot. Captioned as an earlier preview.
- The installer slot remains a labeled placeholder until a successful install is
  captured (an earlier capture shows a failed Calamares run and is deliberately
  not used).

v3.0.0 ships KDE Plasma 6 + SDDM, so **genuine Plasma captures are still
pending**. The desktop images under `~/Desktop/echo_assest/` were checked and
are **not EchoOS** (one is a PhreshOS desktop, the other a Winves mockup) — do
not use them. Capture fresh screenshots from the public v3.0.0 ISO, then update
the captions and claims table.

The reserved slots auto-detect: drop a file at the `src` used by a
`figure[data-shot]` and it replaces the labeled fallback. The old
`reports/echoos-screens/boot-0*.png` files are blank black frames from a failed
capture and are not used anywhere.

---

## Deployment notes

1. Upload the directory contents as-is (or push to `main`; Pages rebuilds).
2. If the domain changes, update the absolute `og:url`, `og:image`, and
   `twitter:image` URLs in `index.html` and `get-started.html`. They currently
   point at the GitHub Pages URL.
3. Confirm the host serves `.webp` as `image/webp`, `.woff2` as `font/woff2`,
   and `.svg` as `image/svg+xml` (GitHub Pages already does).
4. Set long cache lifetimes for `/assets/fonts/*`, `/assets/img/*`, and
   `/assets/css/*`; keep `index.html` short-lived while the preview changes.
5. The download button points to GitHub Releases. The site does not mirror the
   1.70 GiB ISO.
6. If the site is served from a subdirectory, verify the manifest `start_url`
   (`./`) and all relative asset paths.

### Optional security headers

```text
Content-Security-Policy:
  default-src 'self';
  img-src 'self' data:;
  style-src 'self';
  script-src 'self';
  font-src 'self';
  base-uri 'self';
  form-action 'none';
  frame-ancestors 'none'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
```

The site has no inline scripts or third-party requests, so this CSP should work
without nonces.

---

## Accessibility and performance

- Semantic landmarks, one `h1`, ordered headings, skip link.
- Keyboard-operable mobile menu with Escape, focus return, and a focus trap.
- `aria-expanded`, `aria-pressed`, `aria-current`, live-region toast.
- Visible `:focus-visible` rings; no keyboard traps.
- Colour contrast checked against the dark palette.
- `prefers-reduced-motion` disables rings, ticker, scan, smooth scroll, and reveals.
- Images have dimensions and alt text; fallbacks are text, not images.
- Self-hosted WOFF2 fonts (about 67 KB total) with `font-display: swap`.
- No frameworks, no runtime dependencies, no analytics.

---

## License

- Site source and original design: © 2026 Echo OS. No site license is granted
  yet; treat it as project source for review.
- Fonts: SIL Open Font License 1.1. License texts are in `assets/fonts/`.
- Echo OS distribution: **no license file is currently published** in
  `HomieTal/EchoOS-DEV`. The source is viewable, but redistribution rights are
  not granted until the project adds a license.
- Arch Linux, XFCE, KDE, Calamares, and GitHub are projects or trademarks of
  their respective owners. Echo OS is not affiliated with them.

---

## Maintenance checklist

- [x] Public release data is auto-synced (see _Automatic release sync_); check the workflow run if it stalls.
- [ ] Aira still not shipped? Keep the footnote and "planned" chips.
- [x] Desktop is KDE Plasma 6 as of v3.0.0 — claims, roadmap, and step copy updated; keep Aira labelled planned.
- [ ] License still unpublished? Keep the footer wording accurate.
- [ ] Add genuine screenshots when captured from the public ISO.
- [ ] Re-check the three GitHub docs/component links.
- [ ] Re-run the local validation pass.
