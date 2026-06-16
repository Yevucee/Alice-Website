# Production photography

Replace placeholder images by adding files here and updating the CSS variables in `index.html`.

## Required files

| File | Used in | Recommended size | Notes |
|------|---------|------------------|-------|
| `hero.jpg` | Hero background (`.hero-bg`) | ~1800×1100 | Landscape, works with dark overlay + sepia |
| `band-a.jpg` | "Stewarding what should endure" band | ~1800×1000 | Landscape |
| `band-b.jpg` | "On the ground" band | ~1800×1000 | Landscape |

## How to swap

1. Add your three JPEG or WebP files to this folder with the names above.
2. In `index.html`, update the `:root` image variables:

```css
--img-hero: url('assets/hero.jpg');
--img-band-a: url('assets/band-a.jpg');
--img-band-b: url('assets/band-b.jpg');
```

3. Preview locally: `python3 -m http.server 8000`
4. Commit and push — GitHub Actions deploys automatically.

CSS sepia/grayscale filters remain applied in the stylesheet; choose photos that read well with warm, muted treatment.

## Contact email

Current contact: `hello@alicethetimebender.com` (in the contact section of `index.html`).

To change it, search for `hello@alicethetimebender.com` in `index.html` and update both the `mailto:` link and visible text.
