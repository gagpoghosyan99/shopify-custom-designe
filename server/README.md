# NovaMeds server (optional)

Not required for the Shopify storefront. Cart, products, and checkout use Shopify directly.

## Run locally

```bash
cd server
npm start
```

Open http://localhost:3000/health

## Environment

Read from parent `.env`:

- `SHOPIFY_STORE_DOMAIN`
- `PUBLIC_SITE_URL`
- Admin/Storefront tokens — **server-side only**, never in theme JS

## When to extend

- Shopify order webhooks → your ERP
- Custom loyalty or subscription logic
- Storefront API proxy for a future mobile app
