# SynthPage

- `site/`: the synthpage.co.uk website (static files).
- `worker/`: the code that creates Stripe checkout sessions (`/api/*`). Setup steps are in `worker/SETUP.md`.
- `wrangler.jsonc`: tells Cloudflare to deploy both together as one Worker called `synthpage` (`npx wrangler deploy`).

Never commit Stripe keys. They live in the Worker's settings in Cloudflare.
