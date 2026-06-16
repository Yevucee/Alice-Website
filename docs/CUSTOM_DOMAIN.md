# Custom domain setup

Use this when you have a domain (e.g. `alicethetimebender.com`) ready to point at GitHub Pages.

## Prerequisites

- Domain purchased and DNS access at your registrar
- GitHub Pages enabled with **GitHub Actions** source ([setup guide](../.github/PAGES_SETUP.md))

## Steps

### 1. DNS at your registrar

For apex domain (`alicethetimebender.com`):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

For `www` subdomain:

| Type | Name | Value |
|------|------|-------|
| CNAME | `www` | `yevucee.github.io` |

See [GitHub Pages custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for current IP addresses.

### 2. Add CNAME to the repo

Create a file `CNAME` in the repo root containing only your domain:

```
alicethetimebender.com
```

Commit and push to `main`.

### 3. Configure in GitHub

1. [Settings → Pages](https://github.com/Yevucee/Alice-Website/settings/pages)
2. Enter your custom domain under **Custom domain**
3. Wait for DNS check; enable **Enforce HTTPS** when available

### 4. Update SEO URLs in `index.html`

After the domain is live, update:

- `<link rel="canonical" href="...">`
- `<meta property="og:url" content="...">`

Replace `https://yevucee.github.io/Alice-Website/` with your custom domain URL.
