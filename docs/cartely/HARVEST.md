# Cartely rebuild — data harvest (Phase 0)

The rebuild is **content-identical**: every product, price, image, and
description comes from the live store, never invented. Phase 0 pulls that
data into local files that the Next.js app reads at build time.

## Scripts

| Script | What it does | Run it? |
|--------|--------------|---------|
| `scripts/harvest.mjs` | Pulls every product from `/products.json` (paginated), plus the five policy pages and the contact page, into `data/`. | **Yes** — this is Phase 0. |
| `scripts/download-images.mjs` | Mirrors every image into `public/products/<handle>/<position>.webp` and rewrites `data/catalog.json` to local paths. | **No** — only when you later want to self-host images. |

Both are dependency-free (Node 18+ built-in `fetch`). `download-images.mjs`
uses `sharp` for real WebP encoding if it is installed.

## Running the harvest

```bash
node scripts/harvest.mjs
# or point at a different store:
STORE=cartely-2.myshopify.com node scripts/harvest.mjs
```

Output:

```
data/catalog.json            every product, values verbatim
data/policies/<handle>.html  privacy-policy, contact-information,
                             terms-of-service, refund-policy, shipping-policy
data/pages/contact.html      contact page main content
```

The script prints a summary — product count, variant count, image count,
min/max price — to sanity-check against Shopify admin.

## Re-running when you add products in Shopify

Just run `node scripts/harvest.mjs` again. It overwrites `data/catalog.json`
with the current catalog, and `generateStaticParams` regenerates every
product route on the next `npm run build`. No code changes needed.

## ⚠️ Network note — egress policy

`*.myshopify.com` and `cdn.shopify.com` are **not reachable** from the
default Claude Code web egress policy — outbound requests to the store host
return `403` at the proxy. Until the host is allow-listed, the harvest must
run somewhere with open network access. Options:

1. **Allow-list the host** in the environment's egress policy
   (`cartely-2.myshopify.com`, `*.myshopify.com`, `cdn.shopify.com`), then
   run inside the session with the proxy honoured:

   ```bash
   NODE_USE_ENV_PROXY=1 node scripts/harvest.mjs
   ```

2. **Run it on your own machine** (no proxy needed), then commit the
   produced `data/` directory:

   ```bash
   node scripts/harvest.mjs
   git add data && git commit -m "Harvest cartely-2 catalog" && git push
   ```

A Storefront API token does **not** work around this — the request still
goes to the blocked `*.myshopify.com` host. The fix is host allow-listing or
running the harvest off-session.
