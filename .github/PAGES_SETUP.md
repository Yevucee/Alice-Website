# GitHub Pages setup (one-time)

The deploy workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) is configured. Complete this one-time step in GitHub if Pages still shows **legacy** or **errored** status.

## Switch source to GitHub Actions

1. Open [Settings → Pages](https://github.com/Yevucee/Alice-Website/settings/pages)
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Save (no branch/path selection needed when using Actions)
4. Confirm the latest [Deploy to GitHub Pages](https://github.com/Yevucee/Alice-Website/actions/workflows/pages.yml) workflow run succeeded

## Verify live site

- URL: **https://yevucee.github.io/Alice-Website/**
- Expect HTTP 200 and full page content (hero, services, contact)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Legacy build errored | Switch source to GitHub Actions (above) |
| 404 after deploy | Wait 1–2 minutes; hard-refresh browser |
| Workflow failed | Check Actions tab for error logs |
