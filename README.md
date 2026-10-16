# Project Matter

A dependency-free static site with paint, tile, and wallpaper calculators. All calculations run in the browser.

## Verify locally

```sh
npm run verify
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/` and check the three calculators.

## Publish on GitHub Pages

The checked-in canonical URL assumes this repository name:

`https://charlesluo20140904.github.io/material-calculators/`

1. Create a public GitHub repository named `material-calculators`.
2. Push the contents of this directory to its `main` branch.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select **main** and **/(root)**, then save.
5. After deployment, open the URL above and submit `sitemap.xml` in Google Search Console.

The `.nojekyll` file keeps GitHub Pages in plain-static mode. Relative asset links already support the repository subpath.

If the repository name or domain changes, update the canonical URLs, Open Graph URLs, `robots.txt`, `sitemap.xml`, and the link in `404.html` before publishing.

## Search and analytics

- Search Console ownership uses `google33b37af558f1aef9.html`; keep this file deployed.
- Submit `https://charlesluo20140904.github.io/material-calculators/sitemap.xml` in Search Console.
- GA4 uses measurement ID `G-554TWQ868E` through `assets/js/analytics.js`.
- The Google tag loads only after the visitor allows analytics. Calculator input values are never included in events.
- Visitors can review or change their choice from the Privacy page.
