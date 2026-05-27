# NovaMeds — Premium Custom Storefront

| | |
|---|---|
| **Brand** | NovaMeds |
| **Public website** | [https://novameds.shop](https://novameds.shop) |
| **Dev / CLI store** | `novameds.myshopify.com` (internal only — never shown to customers) |

Custom pharmacy & vitamins theme. Checkout, cart, products, orders, inventory, payments, and admin run on the commerce platform backend. The customer-facing site is fully custom — no platform branding, no “Powered by …”, no `myshopify.com` URLs on the public site.

---

## Connect theme locally

CLI is installed at `~/.local/bin/shopify`. Add to PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Option A — Browser login (interactive)

```bash
cd /Users/gagpoghosyan/Desktop/shopify-custom
shopify auth login
shopify theme dev --store novameds.myshopify.com
```

Or use the helper script:

```bash
./scripts/dev.sh
```

### Option B — Theme Access password (recommended for automation)

1. **Shopify Admin** → **Apps** → install **Theme Access**
2. **Create theme password** → copy password (`shptka_…`)
3. Add to `.env`:

   ```bash
   SHOPIFY_CLI_THEME_TOKEN=shptka_your_password_here
   ```

4. Run:

   ```bash
   ./scripts/dev.sh
   # or
   ./scripts/push.sh
   ```

### Option C — Upload ZIP (no CLI login)

A packaged theme is in the project root: **`NovaMeds-1.0.0.zip`**

1. Admin → **Online Store → Themes → Add theme → Upload zip**
2. **Publish** the theme

Regenerate zip anytime:

```bash
shopify theme package
```

Open the preview URL from `theme dev` when using CLI.

---

## Publish

```bash
shopify theme push --store novameds.myshopify.com
```

Then in admin:

**Settings → Domains → Connect `novameds.shop` → Set as primary domain**

Until the primary domain is set, some platform defaults may still use the dev hostname in preview. The theme forces canonical/SEO URLs to `https://novameds.shop` via **Theme settings → Public website URL**.

---

## Environment variables

| Variable | Required? | Value |
|----------|-------------|--------|
| `SHOPIFY_STORE_DOMAIN` | CLI only | `novameds.myshopify.com` |
| `PUBLIC_SITE_URL` | Recommended | `https://novameds.shop` |
| `SHOPIFY_CLI_THEME_TOKEN` | Optional | Theme Access password — enables `dev`/`push` without browser |
| Storefront / Admin tokens | Optional | Server-side scripts only — **never** in theme files |

---

## Theme settings (Customize)

- **Brand name:** `NovaMeds`
- **Public website URL:** `https://novameds.shop`
- **Support email:** `care@novameds.shop`

---

## Project structure

```
layout/theme.liquid       SEO, canonical, NovaMeds branding
assets/novameds-base.css  Design system
assets/novameds-ui.css    Cart drawer, mega menu, mobile nav
sections/                 Homepage + templates
snippets/                 Product card, meta, schema
templates/*.json          OS 2.0 pages
```

---

## Public URL rules

- Canonical links → `https://novameds.shop` + path  
- Open Graph / JSON-LD → `NovaMeds` + `novameds.shop`  
- Footer legal links → `https://novameds.shop/policies/...`  
- No `myshopify.com` or platform name in customer-facing copy  

Cart, checkout, and product URLs use relative/platform routes so commerce keeps working on any connected domain.

---

## Admin checklist

1. **Domains** — `novameds.shop` primary  
2. **Navigation** — `main-menu` with nested links (mega menu)  
3. **Themes → Customize** — logo, Best sellers collection  
4. Collections: vitamins, immunity, energy, sleep  
