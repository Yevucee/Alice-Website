# Alice the Time Bender — Website

A single-page marketing site for Alice the Time Bender, a discreet family-enterprise advisory practice.

**Repository:** [github.com/Yevucee/Alice-Website](https://github.com/Yevucee/Alice-Website)

## Work in Cursor Cloud

This repo is set up for cloud agents. Open it in [Cursor](https://cursor.com) and start a **Cloud Agent** on this repository. Read `CURSOR_PROMPT.md` first — it defines the project constraints (static HTML only, no redesign).

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

**GitHub Pages:** push to a repo, then enable Pages (Settings → Pages → deploy from `main` / root).

## Notes
- The three photographs are placeholders (`picsum.photos/id/1018`, `1015`, `1039`), grayscale + sepia treated in CSS to match the palette. Replace with art-directed photography for production by swapping the image URLs in the `<style>` block (`.hero-bg`, `.band-a`, `.band-b`).
- Contact email is a placeholder: `hello@alicethetimebender.com`.
- Brand palette: bone `#EDEBE7`, charcoal `#1A1A18`, black `#0b0b0a`, ochre accent `#B8923F`.
