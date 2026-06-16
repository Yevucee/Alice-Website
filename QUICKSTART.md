# Quick start — Cursor on Mac, mobile, or cloud

## Open the project

```bash
git clone https://github.com/Yevucee/Alice-Website.git
cd Alice-Website
```

Open the folder in Cursor.

## Edit the site

All content lives in **`index.html`**. Read **`AGENTS.md`** first — agents follow its constraints automatically.

## Preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Recommended: Local agent on Mac

Cloud agents can hang on environment setup for this repo. For daily edits:

1. Open **Agent** in Cursor
2. Switch **Cloud → Local** at the bottom of the input
3. Ask for changes to `index.html`

No install step, no VM wait.

## Cloud agent (phone or away)

1. Use [cursor.com/agents](https://cursor.com/agents) or Cursor mobile
2. Select `Yevucee/Alice-Website`, branch `main`
3. Do **not** recreate a Personal environment — repo `.cursor/environment.json` is empty `{}`
4. If stuck: cancel, use Local on Mac, or retry later

## Deploy

Push to `main` → GitHub Actions deploys to **https://yevucee.github.io/Alice-Website/**

One-time Pages setup: see [`.github/PAGES_SETUP.md`](.github/PAGES_SETUP.md)
