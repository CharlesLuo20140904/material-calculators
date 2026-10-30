# Project Matter

A dependency-free static site with paint, tile, wallpaper, flooring, drywall, and concrete calculators. Twelve source-linked planning guides explain worked examples and product assumptions. About, methodology, editorial, contact, and privacy pages document who maintains the site and how corrections are handled. All calculations run in the browser.

## Verify locally

```sh
npm run verify
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/` and check the six calculators, twelve guides, and trust pages at desktop and mobile widths.

## Production

The production site is:

`https://usefulweblab.com/`

1. Create a public GitHub repository named `material-calculators`.
2. Push the contents of this directory to its `main` branch.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select **main** and **/(root)**, then save.
5. Configure `usefulweblab.com` as the custom domain and enforce HTTPS.

The `.nojekyll` file keeps GitHub Pages in plain-static mode. Relative asset links already support the repository subpath.

The `CNAME` file binds the GitHub Pages deployment to the custom domain. DNS should use GitHub Pages apex records and point `www` to `charlesluo20140904.github.io`.

## Search and analytics

- Search Console ownership uses `google33b37af558f1aef9.html`; keep this file deployed.
- Submit `https://usefulweblab.com/sitemap.xml` in Search Console.
- GA4 uses measurement ID `G-554TWQ868E` through `assets/js/analytics.js`.
- AdSense uses publisher ID `pub-7381591341067052`; `ads.txt` and the site verification code are checked in.
- The Google tag loads only after the visitor allows analytics. Calculator input values are never included in events.
- Visitors can review or change their choice from the Privacy page.

## Publishing standards

- Calculator formulas, rounding rules, and test coverage are documented at `/methodology/`.
- Source selection, software assistance, advertising independence, and corrections are documented at `/editorial-policy/`.
- Corrections use the repository issue tracker linked from `/contact/`.
- Guides cite manufacturer, trade-association, or retailer material for claims that are not simple dimensional arithmetic.
