# NovaMeds — Backend architecture

## Shopify is your backend

For **novameds.shop**, Shopify already provides:

| Feature | Provided by |
|---------|-------------|
| Products, variants, inventory | Shopify Admin |
| Cart & checkout | Shopify Cart API + hosted checkout |
| Orders, customers, payments | Shopify Admin |
| Search | `/search` on storefront |
| Email capture | Customer forms in theme |

The theme uses **Shopify’s public Cart API** (no secret keys in the browser):

- `GET /cart.js` — load cart
- `POST /cart/add.js` — add item
- `POST /cart/change.js` — update quantity

Checkout always goes through Shopify’s secure checkout URL.

## Optional: your own server

Use a separate Node server only if you need:

- Custom webhooks (ERP, SMS, analytics)
- Storefront API proxy (hide tokens from browser)
- Non-Shopify integrations

See `server/` for a minimal starter. **Not required** for the live store.

## Theme “backend” = Liquid + JS

- `assets/novameds.js` — cart drawer, search modal, UI state
- `sections/*.liquid` — server-rendered HTML from Shopify data
- No `.env` tokens in theme files
