# Alice the Time Bender — Website

A single-page marketing site for Alice the Time Bender, a discreet family-enterprise advisory practice.

**Repository:** [github.com/Yevucee/Alice-Website](https://github.com/Yevucee/Alice-Website)

## Use with Cursor (Mac, mobile, or cloud)

This repo is configured for Cursor agents on **any device**:

| Where | How |
|-------|-----|
| **Mac / Desktop** | Open the repo in Cursor → Agent reads `AGENTS.md` automatically |
| **Phone / Mobile** | Open repo in Cursor mobile → start a Cloud Agent for edits |
| **Cloud Agent** | Push is on `main`; `.cursor/environment.json` is minimal (no deps, fast boot) |

### First-time Cloud Agent setup

1. Open [Cursor Dashboard → Cloud Agents](https://cursor.com/dashboard?tab=cloud-agents)
2. Select this repo (`Yevucee/Alice-Website`)
3. **No secrets required** for this static site
4. If a saved personal environment hangs on "Setting up environment", delete it and let the repo's `.cursor/environment.json` take over (or click **Rebuild environment**)
5. Start an agent — it should be ready in seconds

See `AGENTS.md` for full agent constraints (do not redesign the site; static HTML only).

## Stack

- Plain, static **HTML + CSS** in a single file (`index.html`). No build step, no framework, no dependencies.
- Fonts loaded from Google Fonts (Cormorant Garamond + EB Garamond).
- Photography hotlinked from a stable image CDN (picsum.photos) as tonal placeholders.

## Run locally

Just open `index.html` in any browser, or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

This is a static site — it works on GitHub Pages, Netlify, Vercel, or Cloudflare Pages with zero configuration.

**GitHub Pages (recommended):**

1. **One-time:** [Switch Pages source to GitHub Actions](.github/PAGES_SETUP.md)
2. Push to `main` — the `pages.yml` workflow deploys automatically
3. Live URL: **https://yevucee.github.io/Alice-Website/**
4. Custom domain: see [docs/CUSTOM_DOMAIN.md](docs/CUSTOM_DOMAIN.md)

## Quick start (Cursor)

See [QUICKSTART.md](QUICKSTART.md) for Mac Local agent workflow, preview, and deploy.

## Production content

Replace placeholder photography: see [assets/README.md](assets/README.md).

## Notes

- The three photographs are placeholders (`picsum.photos/id/1018`, `1015`, `1039`), grayscale + sepia treated in CSS to match the palette. Replace with art-directed photography for production by swapping the image URLs in the `<style>` block (`.hero-bg`, `.band-a`, `.band-b`).
- Contact email is a placeholder: `hello@alicethetimebender.com`.
- Brand palette: bone `#EDEBE7`, charcoal `#1A1A18`, black `#0b0b0a`, ochre accent `#B8923F`.

## Files for Cursor

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent instructions (desktop, mobile, cloud) |
| `QUICKSTART.md` | Mac Local agent workflow and preview |
| `.github/PAGES_SETUP.md` | One-time GitHub Pages source fix |
| `assets/README.md` | Production photo swap guide |
| `docs/CUSTOM_DOMAIN.md` | Custom domain DNS + CNAME steps |
| `.cursor/environment.json` | Minimal cloud VM config — no blocking install |
| `.cursor/rules/alice-website.mdc` | Always-on project rules |
| `CURSOR_PROMPT.md` | Legacy one-shot setup prompt (superseded by `AGENTS.md`) |
