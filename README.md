# Innovative Testing Solution — website

Multi-page site for Innovative Testing Solution (ITS), a supplier of laboratory chemicals, lab equipment and educational supplies in Al Khobar, Saudi Arabia, with a branch in Dubai.

- **Pages:** Home, Products (quote-request catalogue), Services, About, Contact
- **Hero:** Three.js exploded 96-well plate with blueprint callouts
- **Enquiry flow:** visitors add products to an enquiry list (kept in the browser), then send it from the Contact page by email or WhatsApp. No prices or checkout.

## Develop

```bash
npm install
npm run dev
```

Pushing to `main` builds with Vite and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Placeholder content to replace

- Product list in `src/data/products.js` (representative items, not ITS's real stock)
- Home page stats in `index.html` (24h, 98.6%, 1,200+)
