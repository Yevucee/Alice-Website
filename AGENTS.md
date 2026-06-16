# Alice the Time Bender — Agent Instructions

Read this file before making any changes. These instructions apply in **Cursor Desktop (Mac/Windows/Linux)**, **Cursor Mobile**, and **Cursor Cloud Agents**.

## Project overview

Single-page static marketing site for Alice the Time Bender, a discreet family-enterprise advisory practice.

| Item | Value |
|------|-------|
| Stack | Plain HTML + inline CSS + inline JS in one file |
| Source file | `index.html` |
| Build step | **None** — no `package.json`, bundler, or framework |
| Remote | https://github.com/Yevucee/Alice-Website |

## Hard constraints (do not violate)

1. **Do not redesign, restyle, or rewrite the site** unless the user explicitly asks for a specific change.
2. **Do not add** React, Vue, Tailwind, a bundler, `package.json`, or any build step.
3. **Do not split** `index.html` into separate `.css` or `.js` files — everything intentionally lives inline.
4. **Do not "improve"** copy, colors, fonts, image URLs, or layout without explicit user request.
5. When editing content the user requested, preserve the existing visual language (bone `#EDEBE7`, charcoal `#1A1A18`, ochre `#B8923F`).

## Allowed changes

- Copy or contact details the user requests
- Replacing placeholder photography URLs (`picsum.photos/id/1018`, `1015`, `1039`) with production images
- SEO/meta tags, analytics snippets, or deploy config the user asks for
- Accessibility fixes the user requests

## Preview locally

No install required. Use any of these:

```bash
# Option A — open directly
open index.html          # macOS
xdg-open index.html      # Linux

# Option B — local server (recommended for font/network checks)
python3 -m http.server 8000
# then open http://localhost:8000
```

Verify the page renders before committing visual changes.

## Deploy

Static site — works on GitHub Pages, Netlify, Vercel, or Cloudflare Pages with zero build config.

**GitHub Pages:** push to `main`; the `.github/workflows/pages.yml` workflow deploys automatically once Pages is enabled (Settings → Pages → Source: **GitHub Actions**).

---

## Cursor Cloud specific instructions

This repo has **no dependencies**. Cloud agents should boot instantly with the minimal `.cursor/environment.json` config.

### Environment

- **No `npm install`, `pip install`, or database setup** — skip all of that.
- **No long-running `start` or `terminals` commands** — nothing needs to stay alive.
- To preview during a cloud session: `python3 -m http.server 8000` (run on demand, not in environment startup).

### Typical cloud agent tasks

| Task | What to do |
|------|------------|
| Content edit | Edit `index.html` only; verify in browser |
| New section | Add HTML inside `index.html`, match existing CSS patterns |
| Deploy check | Confirm GitHub Actions Pages workflow succeeded |
| Photography swap | Update URLs in `.hero-bg`, `.band-a`, `.band-b` in the `<style>` block |

### If environment setup hangs

1. Ensure `.cursor/environment.json` has no invalid `snapshot` ID and no blocking `install` script.
2. In [Cursor Dashboard → Cloud Agents](https://cursor.com/dashboard?tab=cloud-agents), remove proxy secrets (`HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`) unless Tailscale is configured.
3. Use **Rebuild environment** or delete the saved personal environment and let the repo's `.cursor/environment.json` take over.
4. If infrastructure errors persist (504/501), wait and retry — often server-side.

### Secrets

This project needs **no API keys or secrets** for normal development. Do not prompt for credentials unless the user adds integrations (analytics, forms, etc.).

---

## Cursor Desktop & Mobile

Works the same everywhere Cursor can open this repo:

1. **Clone or open** the repo in Cursor (Mac app, web, or mobile).
2. **Agent reads** this `AGENTS.md` automatically — no paste step needed.
3. **Chat or Cloud Agent** — ask for specific edits; agent will follow constraints above.
4. **Cloud Agent from phone** — start from the repo in Cursor mobile; cloud handles the VM, you review the PR.

Legacy prompt file `CURSOR_PROMPT.md` mirrors the original setup instructions; prefer this `AGENTS.md` for ongoing work.
