/**
 * NovaMeds optional API server
 * Shopify remains the source of truth for products, cart, checkout, orders.
 *
 * Use this only for custom webhooks or integrations.
 * Load secrets from ../.env — never commit .env
 */
import http from 'http';

const PORT = process.env.PORT || 3000;
const STORE = process.env.SHOPIFY_STORE_DOMAIN || 'novameds.myshopify.com';
const PUBLIC_URL = process.env.PUBLIC_SITE_URL || 'https://novameds.shop';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', PUBLIC_URL);
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, store: STORE, publicUrl: PUBLIC_URL }));
    return;
  }

  if (req.url === '/') {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        name: 'NovaMeds API',
        note: 'Storefront cart/checkout run on Shopify. This server is for future webhooks only.',
        health: '/health',
      })
    );
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`NovaMeds server http://localhost:${PORT}`);
});
