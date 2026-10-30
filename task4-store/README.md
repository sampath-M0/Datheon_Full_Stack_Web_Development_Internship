# Grove Market: E-Commerce Store

Product catalog from FakeStoreAPI with filtering, search, sorting, a persistent slide-out cart and a simulated checkout. No build step, no dependencies.

## Run locally
Open this folder in VS Code, install **Live Server**, right-click `index.html` > **Open with Live Server**.
Open `tests.html` the same way to run the cart and totals unit tests.

## Features
- Products from `https://fakestoreapi.com/products` (men's and women's clothing are merged into one **Clothing** category; "jewelery" is shown as **Jewelry**)
- Category filter, debounced search, sort (price, rating), max-price slider, saved items; filters sync to the URL hash so views are shareable
- Rating stars, badges (Top rated, Popular, Deal), quick view, wishlist
- Cart drawer with badge, quantity +/-, remove with undo, free-shipping progress, promo codes (`WELCOME10`, `GREEN20`, `FREESHIP`), 8% estimated tax and $5.99 shipping under $100
- All money handled in integer cents to avoid floating-point errors
- Checkout: shipping, payment (Luhn card check, expiry, security code), review, order confirmation, order history. Demo only: cards are never stored or sent. Test card: `4242 4242 4242 4242`
- Cart, saved items, orders and filters persist in localStorage
- Resilience: loading skeletons, 8-second timeout, falls back to your last saved catalog, then to a small bundled demo catalog
- Accessible: focus management and inert background while the cart is open, keyboard shortcuts (`/` search, `Esc` close), ARIA labels, reduced-motion support, dark/light theme

## Deploy
Push to GitHub, then enable GitHub Pages or import into Vercel/Netlify (no build command).
